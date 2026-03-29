"use client";

import { motion } from "framer-motion";
import { Phone, Star } from "lucide-react";
import type { Caregiver } from "../types";

interface CaregiverListProps {
  caregivers: Caregiver[];
}

const roleLabel: Record<Caregiver["role"], string> = {
  mãe: "Mãe",
  pai: "Pai",
  avó: "Avó",
  avô: "Avô",
  tio: "Tio",
  tia: "Tia",
  babá: "Babá",
  médico: "Pediatra",
  outro: "Cuidador",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export function CaregiverList({ caregivers }: CaregiverListProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-medium text-text-primary tracking-tight">
          Cuidadores
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-text-secondary hover:bg-surface-variant/40 transition-all border border-surface-variant/20"
        >
          <span className="text-lg leading-none">+</span>
        </motion.button>
      </div>

      <div className="flex flex-col gap-3">
        {caregivers.map((caregiver) => (
          <motion.div
            key={caregiver.id}
            variants={item}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative overflow-hidden bg-surface-container-low rounded-2xl p-4 active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${caregiver.avatarColor}20` }}
              >
                <span
                  className="font-display text-lg font-semibold"
                  style={{ color: caregiver.avatarColor }}
                >
                  {caregiver.name[0]}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-display text-sm font-semibold text-text-primary">
                    {caregiver.name}
                  </span>
                  {caregiver.isPrimary && (
                    <div className="w-4 h-4 rounded-full bg-[#8EAF96]/20 flex items-center justify-center">
                      <Star className="w-2.5 h-2.5 text-[#8EAF96]" fill="#8EAF96" />
                    </div>
                  )}
                </div>
                <span
                  className="font-data text-[10px] uppercase tracking-wider"
                  style={{ color: `${caregiver.avatarColor}cc` }}
                >
                  {roleLabel[caregiver.role]}
                </span>
              </div>

              {/* Phone */}
              {caregiver.phone && (
                <a
                  href={`tel:${caregiver.phone}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-variant/40 hover:bg-surface-variant/60 transition-colors flex-shrink-0"
                >
                  <Phone className="w-4 h-4 text-text-secondary" />
                </a>
              )}

              {/* Chevron */}
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
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
            </div>

            {/* Primary badge */}
            {caregiver.isPrimary && (
              <div className="absolute top-3 right-3">
                <span className="font-data text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#8EAF96]/10 text-[#8EAF96] border border-[#8EAF96]/20">
                  Principal
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
