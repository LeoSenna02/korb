"use client";

import { BabyRegistrationForm } from "./BabyRegistrationForm";
import { BabyGuard } from "./BabyGuard";

export default function BabyPage() {
  return (
    <BabyGuard>
      <main className="min-h-screen bg-surface-dim flex flex-col">
        <BabyRegistrationForm />
      </main>
    </BabyGuard>
  );
}
