import type { Metadata } from "next";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfileClientWrapper } from "@/features/profile/components/ProfileClientWrapper";

export const metadata: Metadata = {
  title: "Perfil — Korb",
  description: "Gerencie o perfil do seu bebê e configurações do aplicativo.",
};

export default function ProfilePage() {
  return (
    <>
      <ProfileHeader />
      <main className="px-6 pb-36 space-y-2">
        <ProfileClientWrapper />
      </main>
    </>
  );
}
