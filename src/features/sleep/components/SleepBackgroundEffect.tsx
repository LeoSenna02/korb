"use client";

import { useSleep } from "@/contexts/SleepContext";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

function detectCoarsePointer(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(pointer: coarse)").matches;
}

function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 9999.123 + 0.12345) * 10000;
  return value - Math.floor(value);
}

/**
 * SleepBackgroundEffect
 * Cria uma atmosfera de "névoa" e "céu estrelado" relaxante.
 * Ativado apenas quando o cronômetro está em execução.
 */
export function SleepBackgroundEffect() {
  const { isActive, isPaused } = useSleep();
  const [isCoarsePointer] = useState(detectCoarsePointer);

  // Mantém o componente no DOM por um tempo após desativar para a animação de saída (fade out)
  // Gera posições e tamanhos aleatórios estáveis para as "estrelas"
  const stars = useMemo(() => {
    const starCount = isCoarsePointer ? 12 : 24;

    return Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      x: `${pseudoRandom(i + 1) * 100}%`,
      y: `${pseudoRandom(i + 101) * 100}%`,
      size: pseudoRandom(i + 201) * (isCoarsePointer ? 1.4 : 2) + 1,
      delay: pseudoRandom(i + 301) * 5,
      duration:
        (isCoarsePointer ? 4.5 : 3) +
        pseudoRandom(i + 401) * (isCoarsePointer ? 3 : 4),
    }));
  }, [isCoarsePointer]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            {/* Blobs de Cores Orgânicos (Aurora/Névoa) */}
            <motion.div
              animate={isPaused ? {} : {
                x: isCoarsePointer ? [-10, 12, -8] : [-20, 20, -10, 30, -20],
                y: isCoarsePointer ? [8, -12, 8] : [10, -20, 30, -10, 10],
                scale: isCoarsePointer ? [1, 1.04, 1] : [1, 1.1, 0.9, 1.05, 1],
              }}
              transition={{
                duration: isCoarsePointer ? 30 : 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle, #7B9E87 0%, transparent 70%)",
                filter: `blur(${isCoarsePointer ? 60 : 80}px)`,
              }}
            />

            <motion.div
              animate={isPaused ? {} : {
                x: isCoarsePointer ? [18, -8, 18] : [30, -10, 20, -20, 30],
                y: isCoarsePointer ? [-16, 14, -16] : [-30, 20, -10, 40, -30],
                scale: isCoarsePointer ? [1.04, 0.98, 1.04] : [1.1, 0.9, 1, 0.95, 1.1],
              }}
              transition={{
                duration: isCoarsePointer ? 34 : 30,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute bottom-[-10%] right-[-10%] w-[90%] h-[90%] rounded-full opacity-15"
              style={{
                background: "radial-gradient(circle, #7A5F3A 0%, transparent 70%)",
                filter: `blur(${isCoarsePointer ? 72 : 100}px)`,
              }}
            />

            <motion.div
              animate={isPaused ? {} : {
                scale: isCoarsePointer ? [1, 1.08, 1] : [1, 1.2, 1],
                opacity: isCoarsePointer ? [0.08, 0.14, 0.08] : [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: isCoarsePointer ? 16 : 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div 
                className="w-[120%] aspect-square rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(147, 131, 237, 0.1) 0%, transparent 60%)",
                  filter: `blur(${isCoarsePointer ? 42 : 60}px)`,
                }}
              />
            </motion.div>

            {/* Estrelas Cintilantes */}
            <div className="absolute inset-0 opacity-40">
              {stars.map((star) => (
                <motion.div
                  key={star.id}
                  className="absolute rounded-full bg-white"
                  style={{
                    left: star.x,
                    top: star.y,
                    width: star.size,
                    height: star.size,
                  }}
                  animate={{
                    opacity: [0.1, isCoarsePointer ? 0.38 : 0.6, 0.1],
                    scale: [1, isCoarsePointer ? 1.18 : 1.3, 1],
                  }}
                  transition={{
                    duration: star.duration,
                    repeat: Infinity,
                    delay: star.delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Vinheta Suave para Profundidade */}
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(circle at center, transparent 20%, rgba(17, 19, 25, 0.6) 100%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
