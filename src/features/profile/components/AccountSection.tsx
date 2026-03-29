"use client";

import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

interface AccountSectionProps {
  userName?: string;
  userEmail?: string;
}

export function AccountSection({ userName, userEmail }: AccountSectionProps) {
  const { logout } = useAuthContext();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-8"
    >
      <h3 className="font-display text-lg font-medium text-text-primary tracking-tight mb-4">
        Conta
      </h3>

      <motion.div
        variants={item}
        className="bg-surface-container-low rounded-2xl border border-surface-variant/20 p-4"
      >
        <motion.div variants={item} className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center border border-surface-variant/20 flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-7 h-7 text-text-secondary"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <span className="font-display text-sm font-semibold text-text-primary block mb-0.5">
              {userName ?? "Usuário"}
            </span>
            <span className="font-data text-[11px] text-text-disabled">
              {userEmail ?? ""}
            </span>
          </div>
        </motion.div>

        <div className="border-t border-surface-variant/10 pt-4">
          <motion.button
            variants={item}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between py-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-variant/40 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-4 h-4 text-text-secondary"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <span className="font-display text-sm font-medium text-text-primary">
                Editar Perfil
              </span>
            </div>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="w-4 h-4 text-text-disabled transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>

          <motion.button
            variants={item}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between py-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-variant/40 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-4 h-4 text-text-secondary"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                  />
                </svg>
              </div>
              <span className="font-display text-sm font-medium text-text-primary">
                Alterar Senha
              </span>
            </div>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="w-4 h-4 text-text-disabled transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>

          <div className="border-t border-surface-variant/10 mt-2 pt-2">
            <motion.button
              variants={item}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={logout}
              className="w-full flex items-center justify-between py-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#CD8282]/10 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-[#CD8282]" />
                </div>
                <span className="font-display text-sm font-medium text-[#CD8282]">
                  Sair da Conta
                </span>
              </div>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="w-4 h-4 text-[#CD8282]/40 transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path
                  d="M6 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
