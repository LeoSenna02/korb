"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

function generateCodeString(): string {
  const array = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => CHARS[b % CHARS.length])
    .join("");
}

interface UseInviteCodeOptions {
  babyId: string;
  userId: string;
}

interface UseInviteCodeReturn {
  code: string | null;
  isLoading: boolean;
  isGenerating: boolean;
  hasCode: boolean;
  generateCode: () => Promise<void>;
}

export function useInviteCode({ babyId, userId }: UseInviteCodeOptions): UseInviteCodeReturn {
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchCode = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("invite_codes")
      .select("code")
      .eq("baby_id", babyId)
      .is("used_by", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setCode(data?.code ?? null);
    setIsLoading(false);
  }, [babyId]);

  useEffect(() => {
    fetchCode();
  }, [fetchCode]);

  const generateCode = useCallback(async () => {
    setIsGenerating(true);
    try {
      const supabase = createClient();
      const newCode = generateCodeString();

      const { error } = await supabase.from("invite_codes").insert({
        code: newCode,
        baby_id: babyId,
        created_by: userId,
        role: "caregiver",
        expires_at: null,
      });

      if (!error) {
        setCode(newCode);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [babyId, userId]);

  return {
    code,
    isLoading,
    isGenerating,
    hasCode: code !== null,
    generateCode,
  };
}
