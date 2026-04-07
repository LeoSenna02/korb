"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { AuthError } from "@/lib/auth/types";
import { getBabyByUserId } from "@/lib/sync/repositories/baby";
import { getDB } from "@/lib/db";
import type { Baby } from "@/lib/db/types";
import { pullAllDataFromServer } from "@/lib/sync/pull";

// ─── Adapter: normaliza User do Supabase para o shape usado no app ────────────

export interface AppUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

function adaptUser(u: User | null): AppUser | null {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email ?? "",
    name: (u.user_metadata?.name as string | undefined) ?? "",
    createdAt: u.created_at,
  };
}

function mapSupabaseError(message: string): AuthError {
  if (
    message.includes("Invalid login credentials") ||
    message.includes("invalid_credentials")
  ) {
    return { code: "INVALID_PASSWORD", message: "E-mail ou senha incorretos" };
  }
  if (
    message.includes("User already registered") ||
    message.includes("already_exists")
  ) {
    return {
      code: "EMAIL_ALREADY_EXISTS",
      message: "Este e-mail já está cadastrado",
    };
  }
  return { code: "UNKNOWN_ERROR", message: "Erro inesperado. Tente novamente." };
}

// ─── Helper: verifica se usuário tem pelo menos um bebê cadastrado ────────────
// Se encontrar bebê no Supabase, também salva no IndexedDB para o BabyContext
// poder carregar imediatamente após o redirect.

async function checkUserHasBaby(
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  try {
    const localBaby = await getBabyByUserId(userId);
    if (localBaby) {
      pullAllDataFromServer(supabase, userId).catch((err) => {
        console.warn("[AuthContext] Background pull failed:", err);
      });
      return true;
    }

    const { data: caregivers, error: cgError } = await supabase
      .from("baby_caregivers")
      .select("baby_id")
      .eq("user_id", userId)
      .limit(1);

    if (cgError) {
      console.error("[AuthContext] Error checking caregivers:", cgError);
      return false;
    }

    if (caregivers && caregivers.length > 0) {
      const babyId = caregivers[0].baby_id;
      const { data: babyRows, error: babyError } = await supabase
        .from("babies")
        .select("*")
        .eq("id", babyId)
        .single();

      if (babyError) {
        console.error("[AuthContext] Error fetching baby:", babyError);
      }

      if (babyRows) {
        try {
          const db = await getDB();
          const existing = await db.get("babies", babyId);
          if (!existing) {
            const baby: Baby = {
              id: babyRows.id,
              userId,
              name: babyRows.name,
              familyName: babyRows.family_name,
              birthDate: babyRows.birth_date,
              birthTime: babyRows.birth_time ?? undefined,
              gender: babyRows.gender as "girl" | "boy",
              bloodType: babyRows.blood_type as Baby["bloodType"],
              photoUrl: babyRows.photo_url ?? undefined,
              createdAt: babyRows.created_at,
              updatedAt: babyRows.updated_at,
            };
            await db.put("babies", baby);
          }
        } catch (dbErr) {
          console.warn("[AuthContext] Failed to cache baby in IndexedDB:", dbErr);
        }

        await pullAllDataFromServer(supabase, userId);
      }

      return true;
    }

    return false;
  } catch (err) {
    console.error("[AuthContext] checkUserHasBaby unexpected error:", err);
    return false;
  }
}

// ─── Context types ────────────────────────────────────────────────────────────

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface AuthResult {
  success: true;
  user: AppUser;
}

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isHydrated: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<AuthResult | AuthError>;
  register: (input: RegisterInput) => Promise<AuthResult | AuthError>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(adaptUser(u));
      setIsHydrated(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(adaptUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!isHydrated || !user) {
      return;
    }

    let cancelled = false;
    let isSyncing = false;

    const syncFromServer = async () => {
      if (cancelled || isSyncing) {
        return;
      }

      isSyncing = true;

      try {
        await pullAllDataFromServer(supabase, user.id);
      } catch (error) {
        console.warn("[AuthContext] Session pull failed:", error);
      } finally {
        isSyncing = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncFromServer();
      }
    };

    void syncFromServer();

    window.addEventListener("focus", syncFromServer);
    window.addEventListener("online", syncFromServer);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", syncFromServer);
      window.removeEventListener("online", syncFromServer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isHydrated, supabase, user]);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = useCallback(
    async (input: LoginInput): Promise<AuthResult | AuthError> => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });

        if (error) return mapSupabaseError(error.message);

        const adapted = adaptUser(data.user);
        if (!adapted)
          return { code: "UNKNOWN_ERROR", message: "Erro ao obter dados do usuário" };

        setUser(adapted);

        const hasBaby = await checkUserHasBaby(data.user.id, supabase);
        if (hasBaby) {
          router.push("/dashboard");
        } else {
          router.push("/baby");
        }

        return { success: true, user: adapted };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, router]
  );

  // ─── Register ──────────────────────────────────────────────────────────────
  const handleRegister = useCallback(
    async (input: RegisterInput): Promise<AuthResult | AuthError> => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: { data: { name: input.name } },
        });

        if (error) return mapSupabaseError(error.message);
        if (!data.user)
          return { code: "UNKNOWN_ERROR", message: "Erro ao criar conta" };

        const adapted = adaptUser(data.user);
        if (!adapted)
          return { code: "UNKNOWN_ERROR", message: "Erro ao obter dados do usuário" };

        setUser(adapted);

        // Registro novo sempre vai para /baby (não tem bebê ainda)
        router.push("/baby");
        return { success: true, user: adapted };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, router]
  );

  // ─── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  }, [supabase, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isHydrated,
      isAuthenticated: user !== null,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
    }),
    [user, isLoading, isHydrated, handleLogin, handleRegister, handleLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = React.use(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return ctx;
}
