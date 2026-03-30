"use client";

import { useSleep } from "@/contexts/SleepContext";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SleepBackgroundEffect
 * Cria uma atmosfera de "névoa" e "céu estrelado" relaxante.
 * Ativado apenas quando o cronômetro está em execução.
 */
export function SleepBackgroundEffect() {
  const { isActive, isPaused } = useSleep();
  const [shouldRender, setShouldRender] = useState(false);

  // Mantém o componente no DOM por um tempo após desativar para a animação de saída (fade out)
  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Gera posições e tamanhos aleatórios estáveis para as "estrelas"
  const stars = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }));
  }, []);

  if (!shouldRender) return null;

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
                x: [-20, 20, -10, 30, -20],
                y: [10, -20, 30, -10, 10],
                scale: [1, 1.1, 0.9, 1.05, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle, #7B9E87 0%, transparent 70%)",
                filter: "blur(80px)",
              }}
            />

            <motion.div
              animate={isPaused ? {} : {
                x: [30, -10, 20, -20, 30],
                y: [-30, 20, -10, 40, -30],
                scale: [1.1, 0.9, 1, 0.95, 1.1],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute bottom-[-10%] right-[-10%] w-[90%] h-[90%] rounded-full opacity-15"
              style={{
                background: "radial-gradient(circle, #7A5F3A 0%, transparent 70%)",
                filter: "blur(100px)",
              }}
            />

            <motion.div
              animate={isPaused ? {} : {
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div 
                className="w-[120%] aspect-square rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(147, 131, 237, 0.1) 0%, transparent 60%)",
                  filter: "blur(60px)",
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
                    opacity: [0.1, 0.6, 0.1],
                    scale: [1, 1.3, 1],
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

