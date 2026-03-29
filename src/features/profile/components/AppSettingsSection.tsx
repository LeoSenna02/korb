"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";
import type { AppSettings, Language, WeightUnit, VolumeUnit } from "../types";

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

interface AppSettingsSectionProps {
  settings: AppSettings;
}

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
  const { openModal } = useModal();

  useEffect(() => {
    if (isOpen) {
      const close = openModal();
      return close;
    }
  }, [isOpen, openModal]);

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

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-highest rounded-t-3xl px-4 pb-8 pt-4"
            style={{ borderRadius: "24px 24px 0 0" }}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-surface-variant rounded-full mx-auto mb-4" />

            {/* Title */}
            <h4 className="font-display text-base font-medium text-text-primary text-center mb-4">
              {label}
            </h4>

            {/* Options */}
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

            {/* Cancel button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 py-3 text-center font-display text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function AppSettingsSection({ settings }: AppSettingsSectionProps) {
  const [local, setLocal] = useState<AppSettings>({ ...settings });

  const update = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => {
    setLocal((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-8"
    >
      <h3 className="font-display text-lg font-medium text-text-primary tracking-tight mb-4">
        Configurações do App
      </h3>

      <motion.div
        variants={item}
        className="bg-surface-container-low rounded-2xl border border-surface-variant/20 overflow-hidden"
      >
        {/* Notificações */}
        <motion.div variants={item} className="px-4">
          <Toggle
            checked={local.notificationsEnabled}
            onChange={(v) => update("notificationsEnabled", v)}
            label="Notificações"
            description="Alertas para mamadas, sono e trocas"
          />
        </motion.div>
        <div className="mx-4 border-t border-surface-variant/10" />

        {/* Som */}
        <motion.div variants={item} className="px-4">
          <Toggle
            checked={local.soundEnabled}
            onChange={(v) => update("soundEnabled", v)}
            label="Sons"
            description="Vibração e toque ao registrar"
          />
        </motion.div>
        <div className="mx-4 border-t border-surface-variant/10" />

        {/* Idioma */}
        <motion.div variants={item} className="px-4">
          <CustomSelector
            label="Idioma"
            value={local.language}
            options={[
              { value: "pt-BR", label: "Português (BR)", description: "Brasil" },
              { value: "en-US", label: "English", description: "United States" },
              { value: "es-ES", label: "Español", description: "España" },
            ]}
            onChange={(v) => update("language", v as Language)}
          />
        </motion.div>
        <div className="mx-4 border-t border-surface-variant/10" />

        {/* Unidade de peso */}
        <motion.div variants={item} className="px-4">
          <CustomSelector
            label="Unidade de Peso"
            value={local.weightUnit}
            options={[
              { value: "kg", label: "Quilogramas", description: "quilogramas (kg)" },
              { value: "lb", label: "Libras", description: "libras (lb)" },
            ]}
            onChange={(v) => update("weightUnit", v as WeightUnit)}
          />
        </motion.div>
        <div className="mx-4 border-t border-surface-variant/10" />

        {/* Unidade de volume */}
        <motion.div variants={item} className="px-4">
          <CustomSelector
            label="Unidade de Volume"
            value={local.volumeUnit}
            options={[
              { value: "ml", label: "Mililitros", description: "mililitros (ml)" },
              { value: "oz", label: "Onças", description: "onças fluidas (oz)" },
            ]}
            onChange={(v) => update("volumeUnit", v as VolumeUnit)}
          />
        </motion.div>
        <div className="mx-4 border-t border-surface-variant/10" />

        {/* Sobre o app */}
        <motion.div variants={item} className="px-4">
          <button className="w-full flex items-center justify-between py-4">
            <div className="text-left">
              <span className="font-display text-sm font-medium text-text-primary block">
                Sobre o Korb
              </span>
              <span className="font-data text-[10px] text-text-disabled mt-0.5 block">
                Versão 1.0.0
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-disabled" />
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
