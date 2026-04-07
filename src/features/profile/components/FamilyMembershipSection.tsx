"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown, House, ShieldCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { subscribeToDataSync } from "@/lib/sync/events";
import type { Tables } from "@/lib/supabase/types";

interface FamilyMembershipSectionProps {
  babyId: string;
  babyName: string;
  familyName: string;
  userId: string;
  userName?: string;
}

interface MembershipState {
  currentRole: string | null;
  isCurrentUserAdmin: boolean;
  memberCount: number | null;
  isLoading: boolean;
  error: string | null;
}

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

type CaregiverRow = Pick<Tables<"baby_caregivers">, "user_id" | "role">;

function isAdminRole(role: string | null | undefined) {
  return role === "owner" || role === "admin";
}

function formatRole(role: string | null) {
  if (isAdminRole(role)) {
    return "Administrador";
  }

  if (role === "caregiver") {
    return "Cuidador";
  }

  return "Membro da familia";
}

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof House;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-surface-variant/10 px-4 py-3.5">
      <div className="w-9 h-9 rounded-xl bg-surface-container-high text-text-secondary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-display text-sm font-medium text-text-secondary block">
          {label}
        </span>
        <span className="font-data text-sm text-text-primary mt-1 block break-words">
          {value}
        </span>
      </div>
    </div>
  );
}

export function FamilyMembershipSection({
  babyId,
  babyName,
  familyName,
  userId,
  userName,
}: FamilyMembershipSectionProps) {
  const [state, setState] = useState<MembershipState>({
    currentRole: null,
    isCurrentUserAdmin: false,
    memberCount: null,
    isLoading: true,
    error: null,
  });

  const loadMembership = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const supabase = createClient();
      const { data, error, count } = await supabase
        .from("baby_caregivers")
        .select("user_id, role", { count: "exact" })
        .eq("baby_id", babyId);

      if (error) {
        throw error;
      }

      const rows = (data ?? []) as CaregiverRow[];
      const currentMembership = rows.find((row) => row.user_id === userId);

      setState({
        currentRole: currentMembership?.role ?? null,
        isCurrentUserAdmin: isAdminRole(currentMembership?.role),
        memberCount: count ?? rows.length,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("[FamilyMembershipSection] Failed to load membership:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Nao foi possivel carregar os membros da familia agora.",
      }));
    }
  }, [babyId, userId]);

  useEffect(() => {
    void loadMembership();
  }, [loadMembership]);

  useEffect(() => {
    return subscribeToDataSync(() => {
      void loadMembership();
    });
  }, [loadMembership]);

  const roleLabel = useMemo(() => formatRole(state.currentRole), [state.currentRole]);

  const adminLabel = useMemo(() => {
    if (state.isCurrentUserAdmin) {
      return userName ? `${userName} (Voce)` : "Voce";
    }

    return "Outro responsavel";
  }, [state.isCurrentUserAdmin, userName]);

  const memberCountLabel = useMemo(() => {
    if (state.isLoading && state.memberCount === null) {
      return "Carregando";
    }

    if (!state.memberCount || state.memberCount <= 1) {
      return "1 cuidador";
    }

    return `${state.memberCount} cuidadores`;
  }, [state.isLoading, state.memberCount]);

  return (
    <motion.div variants={item} className="mb-8">
      <h3 className="font-display text-lg font-medium text-text-primary tracking-tight mb-4">
        Familia atual
      </h3>

      <div className="bg-surface-container-low rounded-2xl border border-surface-variant/20 p-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#A7BFA3]/10 text-[#A7BFA3] flex items-center justify-center shrink-0">
            <House className="w-5 h-5" strokeWidth={2} />
          </div>

          <div className="flex-1 min-w-0">
            <span className="font-data text-[10px] uppercase tracking-[0.18em] text-text-disabled block">
              Familia
            </span>
            <span className="font-display text-lg font-medium text-text-primary mt-1 block break-words">
              {familyName}
            </span>
            <span className="font-data text-[11px] text-text-secondary mt-1.5 block leading-relaxed">
              Voce esta acompanhando {babyName} dentro desta familia.
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <StatRow icon={House} label="Familia" value={familyName} />
          <StatRow icon={ShieldCheck} label="Seu acesso" value={roleLabel} />
          <StatRow icon={Crown} label="Admin da familia" value={adminLabel} />
          <StatRow icon={Users} label="Cuidadores" value={memberCountLabel} />
        </div>

        {state.error && (
          <p className="font-data text-[11px] text-text-disabled mt-3">
            {state.error}
          </p>
        )}
      </div>
    </motion.div>
  );
}
