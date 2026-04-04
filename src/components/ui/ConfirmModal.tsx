"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModal } from "@/contexts/ModalContext";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const { openModal } = useModal();

  useEffect(() => {
    if (isOpen) {
      const closeModal = openModal();
      document.body.style.overflow = "hidden";
      return () => {
        closeModal();
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, openModal]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          />

          <div className="fixed inset-0 flex items-center justify-center z-[90] px-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-low rounded-3xl w-full max-w-sm overflow-hidden pointer-events-auto shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-modal-title"
              aria-describedby="confirm-modal-desc"
            >
              <div className="px-6 pt-8 pb-6 text-center">
                <div
                  className={`w-12 h-12 rounded-full mx-auto mb-5 flex items-center justify-center ${
                    variant === "danger"
                      ? "bg-tertiary-container/15"
                      : "bg-primary-container/15"
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      variant === "danger"
                        ? "text-tertiary"
                        : "text-primary"
                    }`}
                    strokeWidth={1.5}
                  />
                </div>

                <h2
                  id="confirm-modal-title"
                  className="font-display text-lg font-medium text-text-primary leading-snug mb-2"
                >
                  {title}
                </h2>

                <p
                  id="confirm-modal-desc"
                  className="font-data text-xs text-text-secondary leading-relaxed"
                >
                  {description}
                </p>
              </div>

              <div className="px-6 pb-6 flex flex-col gap-2">
                <Button
                  variant={variant === "danger" ? "tertiary" : "primary"}
                  size="md"
                  onClick={onConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    confirmLabel
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-text-secondary hover:text-text-primary"
                >
                  {cancelLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
