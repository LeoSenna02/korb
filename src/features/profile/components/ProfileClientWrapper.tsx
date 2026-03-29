"use client";

import { useState } from "react";
import type { Caregiver, AppSettings, ProfileSection } from "../types";
import { useProfileData } from "../hooks/useProfileData";
import { ProfileTabs } from "./ProfileTabs";
import { BabyProfileCard } from "./BabyProfileCard";
import { CaregiverList } from "./CaregiverList";
import { AppSettingsSection } from "./AppSettingsSection";
import { DataManagementSection } from "./DataManagementSection";
import { AccountSection } from "./AccountSection";
import { MOCK_CAREGIVERS, MOCK_SETTINGS } from "../data/profile-mock-data";

export function ProfileClientWrapper() {
  const { babyProfile, user, dataStats, isLoading } = useProfileData();
  const [activeSection, setActiveSection] = useState<ProfileSection>("caregivers");

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
          Nenhum bebê cadastrado
        </p>
      </div>
    );
  }

  return (
    <>
      <BabyProfileCard baby={babyProfile} />

      <ProfileTabs active={activeSection} onChange={setActiveSection} />

      {activeSection === "caregivers" && (
        <>
          <CaregiverList caregivers={MOCK_CAREGIVERS} />
          <AccountSection userName={user?.name} userEmail={user?.email} />
        </>
      )}

      {activeSection === "settings" && (
        <>
          <AppSettingsSection settings={MOCK_SETTINGS as AppSettings} />
          <AccountSection userName={user?.name} userEmail={user?.email} />
        </>
      )}

      {activeSection === "data" && (
        <>
          <DataManagementSection stats={dataStats} />
          <AccountSection userName={user?.name} userEmail={user?.email} />
        </>
      )}
    </>
  );
}
