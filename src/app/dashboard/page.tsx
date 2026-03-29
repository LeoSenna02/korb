"use client";

import { useState, useCallback } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { BabyHeroWidget } from "@/features/dashboard/components/BabyHeroWidget";
import { QuickActionsGrid } from "@/features/dashboard/components/QuickActionsGrid";
import { RecentActivities } from "@/features/dashboard/components/RecentActivities";
import { useAuth } from "@/lib/auth/hooks";
import { useBaby } from "@/contexts/BabyContext";
import { calculateBabyAge } from "@/lib/utils/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const { baby } = useBaby();
  const [refreshKey, setRefreshKey] = useState(0);

  const firstName = user?.name.split(" ")[0] ?? "";
  const babyAgeTag = baby ? calculateBabyAge(baby.birthDate) : "";

  const handleActivitySaved = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <>
      <DashboardHeader userName={firstName} babyAgeTag={babyAgeTag} />

      <main className="px-6 pb-32">
        <BabyHeroWidget babyName={baby?.name ?? ""} />
        <QuickActionsGrid onSaved={handleActivitySaved} />
        <RecentActivities refreshKey={refreshKey} />
      </main>
    </>
  );
}
