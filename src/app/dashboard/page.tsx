"use client";

import { useState, useCallback } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardAppointmentReminder } from "@/features/dashboard/components/DashboardAppointmentReminder";
import { QuickActionsGrid } from "@/features/dashboard/components/QuickActionsGrid";
import { RecentActivities } from "@/features/dashboard/components/RecentActivities";
import { useAuth } from "@/lib/auth/hooks";

export default function DashboardPage() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const firstName = user?.name.split(" ")[0] ?? "";

  const handleActivitySaved = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <>
      <DashboardHeader userName={firstName} />

      <main className="px-6 pb-32">
        <DashboardAppointmentReminder />
        <QuickActionsGrid onSaved={handleActivitySaved} />
        <RecentActivities refreshKey={refreshKey} />
      </main>
    </>
  );
}
