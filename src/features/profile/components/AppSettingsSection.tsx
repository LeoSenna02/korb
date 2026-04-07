"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { useBaby } from "@/contexts/BabyContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useBabySelection } from "@/contexts/BabySelectionContext";
import { useAppSettings } from "../hooks/useAppSettings";
import { FamilyMembershipSection } from "./FamilyMembershipSection";
import { InviteCodeSection } from "./InviteCodeSection";
import { JoinFamilySection } from "./JoinFamilySection";
import type { Language, WeightUnit, VolumeUnit } from "../types";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1">
        <span className="font-display text-sm font-medium text-text-primary block">
          {label}
        </span>
        {description && (
          <span className="font-data text-[10px] text-text-disabled mt-0.5 block">
            {description}
          </span>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ml-4
          ${checked ? "bg-primary" : "bg-surface-variant"}
        `}
      >
        <span
          className={`
            absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm
            transition-all duration-200
            ${checked ? "left-[22px]" : "left-0.5"}
          `}
        />
      </button>
    </div>
  );
}

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectorProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (val: string) => void;
}

function CustomSelector({ label, value, options, onChange }: CustomSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between py-4"
      >
        <span className="font-display text-sm font-medium text-text-primary">
          {label}
        </span>
        <div className="flex items-center gap-2 ml-4">
          <span className="font-data text-[11px] text-text-secondary">
            {selectedOption?.label}
          </span>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-4 h-4 text-text-disabled"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      <Sheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={label}
      >
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200
                ${
                  value === option.value
                    ? "bg-primary/15 border border-primary/30"
                    : "bg-surface-container-low border border-transparent hover:border-surface-variant/40"
                }
              `}
            >
              <div className="flex flex-col items-start">
                <span className="font-display text-sm font-medium text-text-primary">
                  {option.label}
                </span>
                {option.description && (
                  <span className="font-data text-[10px] text-text-disabled mt-0.5">
                    {option.description}
                  </span>
                )}
              </div>
              {value === option.value && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="w-3 h-3 text-on-primary"
                  >
                    <path
                      d="M3 8l4 4 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="w-full mt-4 py-3 text-center font-display text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancelar
        </button>
      </Sheet>
    </>
  );
}

export function AppSettingsSection() {
  const { settings, updateSetting, isHydrated } = useAppSettings();
  const { babies, baby, refreshBabies } = useBaby();
  const { user } = useAuthContext();
  const { setSelectedBabyId } = useBabySelection();
  const [isBabySwitcherOpen, setIsBabySwitcherOpen] = useState(false);

  if (!isHydrated) {
    return (
      <div className="mb-8">
        <h3 className="font-display text-lg font-medium text-text-primary tracking-tight mb-4">
          Configuracoes do App
        </h3>
        <div className="bg-surface-container-low rounded-2xl border border-surface-variant/20 p-4">
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-text-disabled border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-8"
    >
      <h3 className="font-display text-lg font-medium text-text-primary tracking-tight mb-4">
        Configuracoes do App
      </h3>

      {baby && user && (
        <FamilyMembershipSection
          babyId={baby.id}
          babyName={baby.name}
          familyName={baby.familyName}
          userId={user.id}
          userName={user.name}
        />
      )}

      {babies.length > 1 && (
        <>
          <motion.div variants={item} className="mb-8">
            <button
              type="button"
              onClick={() => setIsBabySwitcherOpen(true)}
              className="w-full bg-surface-container-low rounded-2xl border border-surface-variant/20 px-5 py-4 flex items-center justify-between text-left"
            >
              <div>
                <span className="font-display text-sm font-medium text-text-primary block">
                  Trocar bebe
                </span>
                <span className="font-data text-[11px] text-text-secondary mt-0.5 block">
                  Escolha qual familia voce quer acompanhar agora
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-disabled shrink-0" />
            </button>
          </motion.div>

          <Sheet
            isOpen={isBabySwitcherOpen}
            onClose={() => setIsBabySwitcherOpen(false)}
            title="Trocar bebe"
            subtitle="Selecione a familia que voce quer ver agora"
          >
            <div className="flex flex-col gap-2 pb-4">
              {babies.map((listedBaby) => {
                const isSelected = listedBaby.id === baby?.id;

                return (
                  <button
                    key={listedBaby.id}
                    type="button"
                    onClick={() => {
                      setSelectedBabyId(listedBaby.id);
                      setIsBabySwitcherOpen(false);
                    }}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                      isSelected
                        ? "border-primary/30 bg-primary/10"
                        : "border-surface-variant/20 bg-surface-container-low"
                    }`}
                  >
                    <span className="font-display text-sm font-medium text-text-primary block">
                      {listedBaby.name}
                    </span>
                    <span className="font-data text-[11px] text-text-secondary mt-1 block">
                      Familia {listedBaby.familyName}
                    </span>
                  </button>
                );
              })}
            </div>
          </Sheet>
        </>
      )}

      {baby && user && (
        <InviteCodeSection babyId={baby.id} userId={user.id} />
      )}

      {user && (
        <JoinFamilySection
          userId={user.id}
          onSuccess={async (babyId) => {
            await refreshBabies();
            setSelectedBabyId(babyId);
          }}
        />
      )}

      <motion.div
        variants={item}
        className="bg-surface-container-low rounded-2xl border border-surface-variant/20 overflow-hidden"
      >
        <motion.div variants={item} className="px-4">
          <Toggle
            checked={settings.notificationsEnabled}
            onChange={(v) => updateSetting("notificationsEnabled", v)}
            label="Lembretes no app"
            description="Avisos visuais para consultas e outros eventos quando voce abrir o app"
          />
        </motion.div>
        <div className="mx-4 border-t border-surface-variant/10" />

        <motion.div variants={item} className="px-4">
          <Toggle
            checked={settings.soundEnabled}
            onChange={(v) => updateSetting("soundEnabled", v)}
            label="Sons"
            description="Vibracao e toque ao registrar"
          />
        </motion.div>
        <div className="mx-4 border-t border-surface-variant/10" />

        <motion.div variants={item} className="px-4">
          <CustomSelector
            label="Idioma"
            value={settings.language}
            options={[
              { value: "pt-BR", label: "Portugues (BR)", description: "Brasil" },
              { value: "en-US", label: "English", description: "United States" },
              { value: "es-ES", label: "Espanol", description: "Espana" },
            ]}
            onChange={(v) => updateSetting("language", v as Language)}
          />
        </motion.div>
        <div className="mx-4 border-t border-surface-variant/10" />

        <motion.div variants={item} className="px-4">
          <CustomSelector
            label="Unidade de Peso"
            value={settings.weightUnit}
            options={[
              { value: "kg", label: "Quilogramas", description: "quilogramas (kg)" },
              { value: "lb", label: "Libras", description: "libras (lb)" },
            ]}
            onChange={(v) => updateSetting("weightUnit", v as WeightUnit)}
          />
        </motion.div>
        <div className="mx-4 border-t border-surface-variant/10" />

        <motion.div variants={item} className="px-4">
          <CustomSelector
            label="Unidade de Volume"
            value={settings.volumeUnit}
            options={[
              { value: "ml", label: "Mililitros", description: "mililitros (ml)" },
              { value: "oz", label: "Oncas", description: "oncas fluidas (oz)" },
            ]}
            onChange={(v) => updateSetting("volumeUnit", v as VolumeUnit)}
          />
        </motion.div>
        <div className="mx-4 border-t border-surface-variant/10" />

        <motion.div variants={item} className="px-4">
          <button className="w-full flex items-center justify-between py-4">
            <div className="text-left">
              <span className="font-display text-sm font-medium text-text-primary block">
                Sobre o Korb
              </span>
              <span className="font-data text-[10px] text-text-disabled mt-0.5 block">
                Versao 1.0.0
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-disabled" />
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
