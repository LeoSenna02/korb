"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthResult, AuthError, Session, StoredUser } from "@/lib/auth/types";
import type { LoginInput, RegisterInput } from "@/lib/auth/validation";
import { login as serviceLogin, register as serviceRegister, logout as serviceLogout } from "@/lib/auth/service";
import { getCurrentSession, getSessionUserData } from "@/lib/auth/storage";
import { createAndSetSession, clearSessionCookie } from "@/lib/auth/actions/session";

interface AuthContextValue {
  user: Omit<StoredUser, "passwordHash" | "salt"> | null;
  session: Session | null;
  isLoading: boolean;
  isHydrated: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<AuthResult | AuthError>;
  register: (input: RegisterInput) => Promise<AuthResult | AuthError>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<Omit<StoredUser, "passwordHash" | "salt"> | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // ─── Hydration — restore session from LocalStorage on mount ──────
  useEffect(() => {
    const session_ = getCurrentSession();
    const user_ = getSessionUserData();
    if (session_ && user_) {
      setSession(session_);
      setUser(user_);
    }
    setIsHydrated(true);
  }, []);

  // ─── Login ───────────────────────────────────────────────────────
  const handleLogin = useCallback(
    async (input: LoginInput): Promise<AuthResult | AuthError> => {
      setIsLoading(true);
      try {
        const result = await serviceLogin(input.email, input.password);
        if ("success" in result && result.success === true) {
          await createAndSetSession(result.user.id, result.user.email, result.user.name);
          setUser(result.user);
          setSession(result.session);
          router.push("/dashboard");
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // ─── Register ─────────────────────────────────────────────────────
  const handleRegister = useCallback(
    async (input: RegisterInput): Promise<AuthResult | AuthError> => {
      setIsLoading(true);
      try {
        const result = await serviceRegister(input.name, input.email, input.password);
        if ("success" in result && result.success === true) {
          await createAndSetSession(result.user.id, result.user.email, result.user.name);
          setUser(result.user);
          setSession(result.session);
          router.push("/baby");
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // ─── Logout ────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    serviceLogout();
    clearSessionCookie();
    setUser(null);
    setSession(null);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      isHydrated,
      isAuthenticated: user !== null && session !== null,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
    }),
    [user, session, isLoading, isHydrated, handleLogin, handleRegister, handleLogout]
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
