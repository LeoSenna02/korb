"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/hooks";
import { useBaby } from "@/contexts/BabyContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { DraggableTimer } from "@/features/dashboard/components/DraggableTimer";
import { FeedingTimerProvider } from "@/features/dashboard/hooks/useFeedingTimer";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (!isAuthenticated) return null;
  if (!baby) return null;

  return (
    <FeedingTimerProvider>
      <ModalProvider>
        <div
          className="min-h-screen bg-surface-dim relative"
          style={{ paddingBottom: "calc(8.5rem + env(safe-area-inset-bottom))" }}
        >
          <div className="flex-1">{children}</div>
          <DraggableTimer />
          <BottomNav />
        </div>
      </ModalProvider>
    </FeedingTimerProvider>
  );
}
