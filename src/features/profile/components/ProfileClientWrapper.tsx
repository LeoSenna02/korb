"use client";

import { useState } from "react";
import type { ProfileSection } from "../types";
import { useProfileData } from "../hooks/useProfileData";
import { ProfileTabs } from "./ProfileTabs";
import { BabyProfileCard } from "./BabyProfileCard";
import { BabySummarySection } from "./BabySummarySection";
import { AppSettingsSection } from "./AppSettingsSection";
import { DataManagementSection } from "./DataManagementSection";
import { AccountSection } from "./AccountSection";

export function ProfileClientWrapper() {
  const { babyProfile, user, dataStats, counts, isLoading, refresh } = useProfileData();
  const [activeSection, setActiveSection] = useState<ProfileSection>("summary");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-text-disabled border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!babyProfile) {
    return (
      <div className="text-center py-20">
        <p className="font-display text-sm text-text-disabled">
          Nenhum bebe cadastrado
        </p>
      </div>
    );
  }

  return (
    <>
      <BabyProfileCard baby={babyProfile} />

      <ProfileTabs active={activeSection} onChange={setActiveSection} />

      {activeSection === "summary" && (
        <>
          <BabySummarySection
            counts={counts}
            totalDays={dataStats.totalDays}
          />
          <AccountSection userName={user?.name} userEmail={user?.email} />
        </>
      )}

      {activeSection === "settings" && (
        <>
          <AppSettingsSection />
          <AccountSection userName={user?.name} userEmail={user?.email} />
        </>
      )}

      {activeSection === "data" && (
        <>
          <DataManagementSection stats={dataStats} onImported={refresh} />
          <AccountSection userName={user?.name} userEmail={user?.email} />
        </>
      )}
    </>
  );
}
