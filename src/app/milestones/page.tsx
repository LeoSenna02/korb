"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { MilestonesClient } from "@/features/milestones/components/MilestonesClient";
import { useAuth } from "@/lib/auth/hooks";
import { useBaby } from "@/contexts/BabyContext";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function MilestonesPage() {
  const { isAuthenticated, isHydrated: authHydrated } = useAuth();
  const { baby, isHydrated: babyHydrated } = useBaby();
  const router = useRouter();

  useEffect(() => {
    if (authHydrated && !isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (authHydrated && babyHydrated && !baby) {
      router.replace("/baby");
    }
  }, [authHydrated, babyHydrated, isAuthenticated, baby, router]);

  const dataReady = authHydrated && babyHydrated;

  if (!dataReady) {
    return <LoadingScreen />;
  }

  if (!baby) return null;

  return (
    <main className="px-6 pt-4 pb-32">
      {/* Header */}
      <div className="mb-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-variant/50 transition-colors mb-4"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="font-display text-3xl font-bold text-text-primary tracking-tight">
          Marcos de Desenvolvimento
        </h1>
        <p className="font-data text-sm text-text-secondary mt-2">
          Acompanhe o progresso do seu bebê
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="font-data text-sm text-text-secondary">Carregando...</span>
            </div>
          </div>
        }
      >
        <MilestonesClient />
      </Suspense>
    </main>
  );
}
