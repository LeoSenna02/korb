"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Sheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: SheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-2 right-2 bg-surface-container-low rounded-t-3xl z-[70] px-6 pt-3 pb-safe max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1.5 bg-surface-variant/30 rounded-full" />
            </div>

            {/* Header: title (center) + close button (right) */}
            <div className="flex items-center justify-between mb-8">
              <div className="w-10" />

              {(title || subtitle) && (
                <div className="text-center flex-1">
                  {title && (
                    <h2 className="font-display text-2xl text-text-primary font-semibold leading-tight">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="font-data text-[11px] text-text-secondary tracking-wide mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-surface-variant/20 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-variant/40 transition-colors"
                aria-label="Fechar"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
