"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBaby } from "@/contexts/BabyContext";
import { useAuth } from "@/lib/auth/hooks";

export function BabyGuard({ children }: { children: React.ReactNode }) {
  const { baby, isHydrated } = useBaby();
  const { isAuthenticated, isHydrated: authHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authHydrated && !isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (isHydrated && baby) {
      router.replace("/dashboard");
    }
  }, [authHydrated, isAuthenticated, isHydrated, baby, router]);

  if (!authHydrated || !isHydrated) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-surface-container border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (baby) return null;

  return <>{children}</>;
}
