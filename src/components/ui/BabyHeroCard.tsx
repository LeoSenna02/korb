"use client";

import Image from "next/image";

interface BabyHeroCardProps {
  imageSrc: string;
  quoteLines: string[];
}

export function BabyHeroCard({ imageSrc, quoteLines }: BabyHeroCardProps) {
  return (
    <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-elevated border border-outline-variant/30 mb-8">
      {/* Background Image */}
      <Image
        src={imageSrc}
        alt="Baby Illustration"
        fill
        className="object-cover brightness-[0.7] contrast-[1.1]"
      />
      
      {/* Semi-transparent Overlay (Bottom Gradient) */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/80 via-transparent to-transparent" />
      
      {/* Quote Text */}
      <div className="absolute left-6 bottom-6 max-w-[80%]">
        <p className="font-data text-xs text-text-primary uppercase leading-relaxed tracking-widest drop-shadow-md">
          {quoteLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
