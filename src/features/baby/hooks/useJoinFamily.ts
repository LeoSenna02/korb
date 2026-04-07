"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { pullAllDataFromServer } from "@/lib/sync/pull";

export type JoinFamilyError = "INVALID_CODE" | "ALREADY_MEMBER" | "NETWORK_ERROR";

export interface JoinFamilyResult {
  success: boolean;
  babyId?: string;
  error?: JoinFamilyError;
}

interface UseJoinFamilyOptions {
  userId: string;
  onSuccess?: (babyId: string) => void;
}

interface UseJoinFamilyReturn {
  isJoining: boolean;
  isSuccess: boolean;
  error: JoinFamilyError | null;
  joinFamily: (code: string) => Promise<JoinFamilyResult>;
  reset: () => void;
}

export function useJoinFamily({ userId, onSuccess }: UseJoinFamilyOptions): UseJoinFamilyReturn {
  const [isJoining, setIsJoining] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<JoinFamilyError | null>(null);

  const joinFamily = useCallback(
    async (code: string): Promise<JoinFamilyResult> => {
      setIsJoining(true);
      setError(null);
      setIsSuccess(false);

      const normalizedCode = code.toUpperCase().trim();

      try {
        const supabase = createClient();

        const { data, error: rpcError } = await supabase.rpc("join_family_with_code", {
          p_code: normalizedCode,
          p_user_id: userId,
        });

        if (rpcError) {
          setIsJoining(false);
          setError("NETWORK_ERROR");
          return { success: false, error: "NETWORK_ERROR" };
        }

        const result = data as unknown as JoinFamilyResult;

        if (!result.success) {
          setIsJoining(false);
          setError(result.error as JoinFamilyError);
          return result;
        }

        await pullAllDataFromServer(supabase, userId);

        setIsJoining(false);
        setIsSuccess(true);

        if (result.babyId && onSuccess) {
          onSuccess(result.babyId);
        }

        return result;
      } catch {
        setIsJoining(false);
        setError("NETWORK_ERROR");
        return { success: false, error: "NETWORK_ERROR" };
      }
    },
    [userId, onSuccess]
  );

  const reset = useCallback(() => {
    setIsJoining(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  return {
    isJoining,
    isSuccess,
    error,
    joinFamily,
    reset,
  };
}

export function getErrorMessage(error: JoinFamilyError): string {
  switch (error) {
    case "INVALID_CODE":
      return "Codigo invalido ou expirado";
    case "ALREADY_MEMBER":
      return "Voce ja faz parte desta familia";
    case "NETWORK_ERROR":
      return "Erro de conexao. Tente novamente.";
    default:
      return "Erro inesperado";
  }
}
