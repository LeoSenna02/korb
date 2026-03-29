"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/hooks";
import { useBaby } from "@/contexts/BabyContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { DraggableTimer } from "@/features/dashboard/components/DraggableTimer";
import { FeedingTimerProvider } from "@/features/dashboard/hooks/useFeedingTimer";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const MIN_LOADING_MS = 2500;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isHydrated: authHydrated } = useAuth();
  const { baby, isHydrated: babyHydrated } = useBaby();
  const router = useRouter();

  const [minimumDelayPassed, setMinimumDelayPassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinimumDelayPassed(true), MIN_LOADING_MS);
    return () => clearTimeout(timer);
  }, []);

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

  if (!dataReady || !minimumDelayPassed) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) return null;
  if (!baby) return null;

  return (
    <FeedingTimerProvider>
      <ModalProvider>
        <div className="min-h-screen bg-surface-dim pb-20 relative">
          <div className="flex-1">{children}</div>
          <DraggableTimer />
          <BottomNav />
        </div>
      </ModalProvider>
    </FeedingTimerProvider>
  );
}
