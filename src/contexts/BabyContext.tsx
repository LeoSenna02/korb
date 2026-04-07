"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuthContext } from "./AuthContext";
import { useBabySelection } from "./BabySelectionContext";
import type { Baby } from "@/lib/db/types";
import {
  saveBaby as syncSaveBaby,
  getBabiesByUserId,
  getBabyById,
  updateBaby as syncUpdateBaby,
} from "@/lib/sync/repositories/baby";
import { createClient } from "@/lib/supabase/client";
import { getDB } from "@/lib/db";
import { subscribeToDataSync } from "@/lib/sync/events";

interface BabyContextValue {
  babies: Baby[];
  baby: Baby | null;
  isLoading: boolean;
  isHydrated: boolean;
  saveBaby: (data: Omit<Baby, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<Baby>;
  updateBaby: (data: Partial<Omit<Baby, "id" | "userId" | "createdAt">>) => Promise<Baby>;
  refreshBaby: () => Promise<void>;
  refreshBabies: () => Promise<void>;
}

const BabyContext = createContext<BabyContextValue | null>(null);

export function BabyProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isHydrated: authHydrated } = useAuthContext();
    const { selectedBabyId, setSelectedBabyId } = useBabySelection();

    const [babies, setBabies] = useState<Baby[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        if (!authHydrated) return;

        if (!isAuthenticated || !user) {
            setBabies([]);
            setIsHydrated(true);
            return;
        }

        let cancelled = false;

        async function loadBabies() {
            setIsLoading(true);
            try {
                const localBabies = await getBabiesByUserId(user!.id);
                if (!cancelled && localBabies.length > 0) {
                    setBabies(localBabies);
                    if (!selectedBabyId || !localBabies.some((item) => item.id === selectedBabyId)) {
                        setSelectedBabyId(localBabies[0].id);
                    }
                    setIsHydrated(true);
                    setIsLoading(false);
                    return;
                }

                const supabase = createClient();
                const { data: caregiverRows, error: caregiverError } = await supabase
                    .from("baby_caregivers")
                    .select("baby_id")
                    .eq("user_id", user!.id);

                if (!cancelled && caregiverError) {
                    console.warn("[BabyContext] Error fetching caregivers:", caregiverError);
                }

                if (!cancelled && caregiverRows && caregiverRows.length > 0) {
                    const babyIds = caregiverRows.map((r) => r.baby_id);
                    const { data: babyRows, error: babiesError } = await supabase
                        .from("babies")
                        .select("*")
                        .in("id", babyIds);

                    if (!cancelled && babiesError) {
                        console.warn("[BabyContext] Error fetching babies:", babiesError);
                    }

                    if (!cancelled && babyRows && babyRows.length > 0) {
                        const mapped: Baby[] = babyRows.map((r) => ({
                            id: r.id,
                            userId: user!.id,
                            name: r.name,
                            familyName: r.family_name,
                            birthDate: r.birth_date,
                            birthTime: r.birth_time ?? undefined,
                            gender: r.gender as "girl" | "boy",
                            bloodType: r.blood_type as Baby["bloodType"],
                            photoUrl: r.photo_url ?? undefined,
                            createdAt: r.created_at,
                            updatedAt: r.updated_at,
                        }));

                        try {
                            const db = await getDB();
                            for (const baby of mapped) {
                                const existing = await db.get("babies", baby.id);
                                if (!existing) {
                                    await db.put("babies", baby);
                                }
                            }
                        } catch (dbErr) {
                            console.warn("[BabyContext] Failed to cache babies in IndexedDB:", dbErr);
                        }

                        setBabies(mapped);
                        if (!selectedBabyId && mapped.length > 0) {
                            setSelectedBabyId(mapped[0].id);
                        }
                    }
                }
            } catch (err) {
                console.error("[BabyContext] Failed to load babies:", err);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                    setIsHydrated(true);
                }
            }
        }

        loadBabies();
        return () => { cancelled = true; };
    }, [authHydrated, isAuthenticated, selectedBabyId, setSelectedBabyId, user]);

    const baby = useMemo(
        () => babies.find((b) => b.id === selectedBabyId) ?? babies[0] ?? null,
        [babies, selectedBabyId]
    );

    const refreshBaby = useCallback(async () => {
        if (!baby) return;
        try {
            const result = await getBabyById(baby.id);
            if (result) {
                setBabies((prev) => {
                    const filtered = prev.filter((b) => b.id !== result.id);
                    return [result, ...filtered];
                });
            }
        } catch (err) {
            console.error("[BabyContext] Failed to refresh baby:", err);
        }
    }, [baby]);

    const handleRefreshBabies = useCallback(async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            const supabase = createClient();
            const { data: caregiverRows, error: caregiverError } = await supabase
                .from("baby_caregivers")
                .select("baby_id")
                .eq("user_id", user!.id);

            if (caregiverError) {
                console.warn("[BabyContext] Error fetching caregivers:", caregiverError);
            }

            if (caregiverRows && caregiverRows.length > 0) {
                const babyIds = caregiverRows.map((r) => r.baby_id);
                const { data: babyRows, error: babiesError } = await supabase
                    .from("babies")
                    .select("*")
                    .in("id", babyIds);

                if (babiesError) {
                    console.warn("[BabyContext] Error fetching babies:", babiesError);
                }

                if (babyRows && babyRows.length > 0) {
                    const mapped: Baby[] = babyRows.map((r) => ({
                        id: r.id,
                        userId: user!.id,
                        name: r.name,
                        familyName: r.family_name,
                        birthDate: r.birth_date,
                        birthTime: r.birth_time ?? undefined,
                        gender: r.gender as "girl" | "boy",
                        bloodType: r.blood_type as Baby["bloodType"],
                        photoUrl: r.photo_url ?? undefined,
                        createdAt: r.created_at,
                        updatedAt: r.updated_at,
                    }));

                    try {
                        const db = await getDB();
                        for (const baby of mapped) {
                            const existing = await db.get("babies", baby.id);
                            if (!existing) {
                                await db.put("babies", baby);
                            }
                        }
                    } catch (dbErr) {
                        console.warn("[BabyContext] Failed to cache babies in IndexedDB:", dbErr);
                    }

                    setBabies(mapped);
                    if (!selectedBabyId && mapped.length > 0) {
                        setSelectedBabyId(mapped[0].id);
                    }
                }
            }
        } catch (err) {
            console.error("[BabyContext] Failed to refresh babies:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user, selectedBabyId, setSelectedBabyId]);

    useEffect(() => {
        if (!authHydrated || !isAuthenticated || !user) {
            return;
        }

        return subscribeToDataSync(() => {
            void handleRefreshBabies();
        });
    }, [authHydrated, handleRefreshBabies, isAuthenticated, user]);

    const handleSaveBaby = useCallback(
        async (data: Omit<Baby, "id" | "userId" | "createdAt" | "updatedAt">) => {
            if (!user) throw new Error("User not authenticated");
            setIsLoading(true);
            try {
                const saved = await syncSaveBaby({ ...data, userId: user.id });

                const supabase = createClient();
                await supabase.rpc("create_baby_with_owner", {
                    p_id: saved.id,
                    p_name: saved.name,
                    p_family_name: saved.familyName,
                    p_birth_date: saved.birthDate,
                    p_birth_time: saved.birthTime ?? null,
                    p_gender: saved.gender,
                    p_blood_type: saved.bloodType ?? null,
                    p_photo_url: saved.photoUrl ?? null,
                } as never);

                setBabies((prev) => [saved, ...prev.filter((b) => b.id !== saved.id)]);
                setSelectedBabyId(saved.id);
                return saved;
            } finally {
                setIsLoading(false);
            }
        },
        [user, setSelectedBabyId]
    );

    const handleUpdateBaby = useCallback(
        async (data: Partial<Omit<Baby, "id" | "userId" | "createdAt">>) => {
            if (!baby) throw new Error("No baby to update");
            setIsLoading(true);
            try {
                const updated = await syncUpdateBaby(baby.id, data);
                setBabies((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
                return updated;
            } finally {
                setIsLoading(false);
            }
        },
        [baby]
    );

    const value = useMemo<BabyContextValue>(
        () => ({
            babies,
            baby,
            isLoading,
            isHydrated,
            saveBaby: handleSaveBaby,
            updateBaby: handleUpdateBaby,
            refreshBaby,
            refreshBabies: handleRefreshBabies,
        }),
        [babies, baby, isLoading, isHydrated, handleSaveBaby, handleUpdateBaby, refreshBaby, handleRefreshBabies]
    );

    return <BabyContext.Provider value={value}>{children}</BabyContext.Provider>;
}

export function useBaby(): BabyContextValue {
    const ctx = React.use(BabyContext);
    if (!ctx) {
        throw new Error("useBaby must be used inside BabyProvider");
    }
    return ctx;
}
