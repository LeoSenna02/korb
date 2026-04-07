"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  Input,
  DateInput,
  TimeInput,
  GenderSelector,
  BloodTypeSelector,
  BabyHeroCard,
} from "@/components/ui";
import { babyRegistrationSchema, type BabyRegistrationInput } from "@/features/baby/schemas";
import { useBaby } from "@/contexts/BabyContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { JoinFamilySheet } from "@/features/baby/components/JoinFamilySheet";

export function BabyRegistrationForm() {
  const { saveBaby, refreshBabies } = useBaby();
  const { user } = useAuthContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BabyRegistrationInput, string>>>({});
  const [isJoinSheetOpen, setIsJoinSheetOpen] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const rawData = {
      babyName: formData.get("babyName") as string,
      familyName: formData.get("familyName") as string,
      birthDate: formData.get("birthDate") as string,
      birthTime: (formData.get("birthTime") as string) || undefined,
      gender: formData.get("gender") as "girl" | "boy",
      email: (formData.get("email") as string) || "",
      bloodType: (formData.get("bloodType") as string) as BabyRegistrationInput["bloodType"],
    };

    const result = babyRegistrationSchema.safeParse(rawData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BabyRegistrationInput, string>> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof BabyRegistrationInput;
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await saveBaby({
        name: rawData.babyName,
        familyName: rawData.familyName,
        birthDate: rawData.birthDate,
        birthTime: rawData.birthTime,
        gender: rawData.gender,
        bloodType: rawData.bloodType,
      });
      router.push("/dashboard");
    } catch (err) {
      setIsSubmitting(false);
      console.error("[BabyRegistration] Error:", err);
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-dim pt-8">
      <div className="px-6">
        <BabyHeroCard
          imageSrc="/assets/images/baby-hero.png"
          quoteLines={["CADA GRAMA É UM MARCO.", "CADA CENTÍMETRO É UM", "NOVO COMEÇO."]}
        />
      </div>

      <header className="px-6 pb-6 mt-8">
        <h1 className="font-display text-3xl text-text-primary font-medium mb-3">
          Quem vamos cuidar?
        </h1>
        <p className="font-data text-sm text-text-secondary leading-relaxed">
          Conte-nos um pouco sobre o mais novo membro<br />da família para personalizarmos sua experiência.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col px-6 pb-8 gap-6"
      >
        <div className="flex flex-col gap-6 bg-surface-container-low p-6 rounded-[32px] border border-surface-variant/10 shadow-sm transition-all duration-300">
          <Input
            label="NOME DO BEBÊ"
            name="babyName"
            placeholder="Ex: João"
            autoComplete="off"
            className="border-none bg-surface-container-high rounded-2xl h-14"
            required
            error={errors.babyName}
          />

          <Input
            label="SOBRENOME DA FAMÍLIA"
            name="familyName"
            placeholder="Ex: Silva"
            autoComplete="off"
            className="border-none bg-surface-container-high rounded-2xl h-14"
            required
            error={errors.familyName}
          />

          <GenderSelector
            name="gender"
            label="GÊNERO"
            required
            error={errors.gender}
          />

          <BloodTypeSelector
            name="bloodType"
            label="TIPO SANGUÍNEO (OPCIONAL)"
          />
        </div>

        <DateInput
          label="DATA DE NASCIMENTO"
          name="birthDate"
          required
          error={errors.birthDate}
        />

        <TimeInput
          label="HORA (OPCIONAL)"
          name="birthTime"
          error={errors.birthTime}
        />

        <div className="flex-1 min-h-[40px]" />

        <div className="sticky bottom-6 pb-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-16 bg-[#8EAF96] hover:bg-[#7D9F85] active:scale-[0.98] text-[#1E2024] font-display font-semibold rounded-[24px] flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-[#8EAF96]/10"
          >
            {isSubmitting ? "SALVANDO..." : "TUDO PRONTO!"}
            {!isSubmitting && <ArrowRight className="w-6 h-6" strokeWidth={2.5} />}
          </button>

          <p className="text-center mt-4 font-data text-sm text-text-secondary">
            Ja tem uma familia?{" "}
            <button
              type="button"
              onClick={() => setIsJoinSheetOpen(true)}
              className="text-[#88AFC7] hover:underline"
            >
              Entre com o codigo
            </button>
          </p>
        </div>
      </form>

      {user && (
        <JoinFamilySheet
          isOpen={isJoinSheetOpen}
          onClose={() => setIsJoinSheetOpen(false)}
          userId={user.id}
          onSuccess={async () => {
            await refreshBabies();
            router.push("/dashboard");
          }}
        />
      )}
    </div>
  );
}
