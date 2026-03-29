"use client";

import { motion } from "framer-motion";

export function BabyHeroWidget({ babyName }: { babyName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative w-full h-40 rounded-[28px] overflow-hidden shadow-elevated mb-6 bg-surface-container-low group"
    >
      {/* Premium Background gradients/noise */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D2A26] to-[#1E1C1A]" />
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
        }}
      />
      {/* Decorative Blur Blobs */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D2B59D]/20 rounded-full blur-3xl opacity-60 mix-blend-screen transition-opacity group-hover:opacity-80 duration-700" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#9FBBA8]/20 rounded-full blur-2xl opacity-60 mix-blend-screen transition-opacity group-hover:opacity-80 duration-700" />

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <span className="font-data text-[10px] text-text-secondary tracking-[0.2em] uppercase mb-1">
          A JORNADA DE
        </span>
        <h2 className="font-display text-3xl text-text-primary tracking-tight font-medium">
          {babyName}
        </h2>
      </div>
    </motion.div>
  );
}