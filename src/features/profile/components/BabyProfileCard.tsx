"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Pencil, Calendar, Clock, Droplet } from "lucide-react";
import type { BabyProfile } from "../types";
import { formatDate, formatDateLong, parseDateLocal } from "@/lib/utils/format";
import { BabyEditSheet } from "./BabyEditSheet";

interface BabyProfileCardProps {
  baby: BabyProfile;
  onUpdated?: () => void;
}

function getAgeInWeeks(birthDate: string): string {
  const birth = parseDateLocal(birthDate);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  if (weeks === 0) return `${days} dias`;
  if (remainingDays === 0) return `${weeks} semanas`;
  return `${weeks} sem. e ${remainingDays} dias`;
}

export function BabyProfileCard({ baby, onUpdated }: BabyProfileCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const birthDateFormatted = formatDateLong(baby.birthDate);
  const fullAge = getAgeInWeeks(baby.birthDate);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-8"
      >
        {/* Profile Header - Editorial Style */}
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="relative w-20 h-20 rounded-3xl bg-surface-container-low flex items-center justify-center flex-shrink-0 overflow-hidden border border-outline-variant/10 shadow-sm"
          >
            {baby.photoUrl ? (
              <Image
                src={baby.photoUrl}
                alt={baby.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-[#D2B59D]/30 to-[#9FBBA8]/30 opacity-60" />
                <span className="relative font-display text-4xl text-text-primary font-medium z-10">
                  {baby.name[0]}
                </span>
              </>
            )}
          </motion.div>

          {/* Name & Age */}
          <div className="flex-1 pt-1">
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="font-data text-[9px] uppercase tracking-[0.25em] text-text-disabled block mb-1"
            >
              Ficha do Bebê
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="font-display text-2xl text-text-primary tracking-tight font-medium mb-2"
            >
              {baby.name}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-[#8EAF96]/15 text-[#8EAF96] font-data text-[10px] font-medium"
            >
              {fullAge}
            </motion.div>
          </div>

          {/* Edit Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            onClick={() => setIsEditOpen(true)}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-container-high transition-colors flex-shrink-0"
            aria-label="Editar informações do bebê"
          >
            <Pencil className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>
        </div>

        {/* Info Grid - 3 columns */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="grid grid-cols-3 gap-2"
        >
          {/* Card: Nasceu */}
          <div className="bg-surface-container-low rounded-2xl p-3 text-center flex flex-col items-center justify-center min-h-[84px] border border-outline-variant/10 group hover:border-primary/20 transition-all duration-300">
            <div className="w-6 h-6 rounded-full bg-surface-variant/30 flex items-center justify-center mb-1.5 group-hover:bg-primary/10 transition-colors">
              <Calendar className="w-3 h-3 text-text-disabled group-hover:text-primary transition-colors" strokeWidth={1.5} />
            </div>
            <span className="font-data text-[8px] uppercase tracking-wider text-text-disabled block mb-1">
              Nasceu
            </span>
            <span className="font-display text-xs font-medium text-text-primary leading-tight block">
              {formatDate(baby.birthDate)}
            </span>
          </div>

          {/* Card: Gestação */}
          <div className="bg-surface-container-low rounded-2xl p-3 text-center flex flex-col items-center justify-center min-h-[84px] border border-outline-variant/10 group hover:border-primary/20 transition-all duration-300">
            <div className="w-6 h-6 rounded-full bg-surface-variant/30 flex items-center justify-center mb-1.5 group-hover:bg-primary/10 transition-colors">
              <Clock className="w-3 h-3 text-text-disabled group-hover:text-primary transition-colors" strokeWidth={1.5} />
            </div>
            <span className="font-data text-[8px] uppercase tracking-wider text-text-disabled block mb-1">
              Gestação
            </span>
            <span className="font-display text-xs font-medium text-text-primary leading-tight block">
              {baby.gestationalWeeks} sem.
            </span>
          </div>

          {/* Card: Sangue */}
          <div className="bg-surface-container-low rounded-2xl p-3 text-center flex flex-col items-center justify-center min-h-[84px] border border-outline-variant/10 group hover:border-primary/20 transition-all duration-300">
            <div className="w-6 h-6 rounded-full bg-surface-variant/30 flex items-center justify-center mb-1.5 group-hover:bg-primary/10 transition-colors">
              <Droplet className="w-3 h-3 text-text-disabled group-hover:text-primary transition-colors" strokeWidth={1.5} />
            </div>
            <span className="font-data text-[8px] uppercase tracking-wider text-text-disabled block mb-1">
              Sangue
            </span>
            <span className="font-display text-xs font-medium text-text-primary leading-tight block">
              {baby.bloodType ?? "—"}
            </span>
          </div>
        </motion.div>
      </motion.div>

      <BabyEditSheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  );
}
