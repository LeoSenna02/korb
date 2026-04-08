"use server";

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import type {
  ActiveSleepSession,
  SleepSessionActionErrorCode,
  SleepSessionActionResult,
} from "../types";
import {
  completeSleepSessionSchema,
  sleepSessionCommandSchema,
  startSleepSessionSchema,
  type CompleteSleepSessionInput,
  type SleepSessionCommandInput,
  type StartSleepSessionInput,
} from "../validation";

type RpcSleepSessionResponse = Json;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSleepType(value: unknown): value is ActiveSleepSession["type"] {
  return value === "nap" || value === "night";
}

function parseActiveSleepSession(value: unknown): ActiveSleepSession | null {
  if (!isObject(value)) {
    return null;
  }

  const babyId = value["baby_id"];
  const type = value["type"];
  const startedAt = value["started_at"];
  const isPaused = value["is_paused"];
  const pausedTotalMs = value["paused_total_ms"];
  const pauseStartedAt = value["pause_started_at"];
  const startedBy = value["started_by"];
  const updatedBy = value["updated_by"];
  const createdAt = value["created_at"];
  const updatedAt = value["updated_at"];

  if (
    typeof babyId !== "string" ||
    !isSleepType(type) ||
    typeof startedAt !== "string" ||
    typeof isPaused !== "boolean" ||
    typeof pausedTotalMs !== "number" ||
    typeof startedBy !== "string" ||
    typeof updatedBy !== "string" ||
    typeof createdAt !== "string" ||
    typeof updatedAt !== "string"
  ) {
    return null;
  }

  return {
    babyId,
    type,
    startedAt,
    isPaused,
    pausedTotalMs,
    pauseStartedAt: typeof pauseStartedAt === "string" ? pauseStartedAt : undefined,
    startedBy,
    updatedBy,
    createdAt,
    updatedAt,
  };
}

function buildErrorResult(
  errorCode: SleepSessionActionErrorCode,
  message: string
): SleepSessionActionResult {
  return {
    success: false,
    session: null,
    errorCode,
    message,
  };
}

function normalizeRpcResult(data: RpcSleepSessionResponse): SleepSessionActionResult {
  if (!isObject(data)) {
    return buildErrorResult("UNKNOWN_ERROR", "Resposta invalida da sessao de sono.");
  }

  const success = data["success"];
  const session = parseActiveSleepSession(data["session"]);
  const errorCode = data["error_code"];
  const message = data["message"];

  if (success === true) {
    return {
      success: true,
      session,
    };
  }

  if (
    success === false &&
    typeof errorCode === "string" &&
    typeof message === "string"
  ) {
    return buildErrorResult(
      errorCode as SleepSessionActionErrorCode,
      message
    );
  }

  return buildErrorResult("UNKNOWN_ERROR", "Nao foi possivel processar a sessao de sono.");
}

async function ensureAuthorizedBabyAccess(babyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false as const,
      result: buildErrorResult("UNAUTHENTICATED", "Sessao invalida."),
    };
  }

  const { data, error } = await supabase
    .from("baby_caregivers")
    .select("baby_id")
    .eq("baby_id", babyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false as const,
      result: buildErrorResult("UNAUTHORIZED", "Sem permissao para este bebe."),
    };
  }

  return {
    ok: true as const,
    supabase,
  };
}

async function invokeSleepSessionRpc(
  name:
    | "start_sleep_session"
    | "pause_sleep_session"
    | "resume_sleep_session"
    | "cancel_sleep_session"
    | "complete_sleep_session",
  args: Record<string, string | null>
): Promise<SleepSessionActionResult> {
  const access = await ensureAuthorizedBabyAccess(args["p_baby_id"] ?? "");
  if (!access.ok) {
    return access.result;
  }

  const { data, error } = await access.supabase.rpc(name, args as never);
  if (error) {
    return buildErrorResult("UNKNOWN_ERROR", "Erro ao sincronizar sessao de sono.");
  }

  return normalizeRpcResult(data);
}

export async function startSleepSessionAction(
  input: StartSleepSessionInput
): Promise<SleepSessionActionResult> {
  const parsed = startSleepSessionSchema.safeParse(input);
  if (!parsed.success) {
    return buildErrorResult(
      "INVALID_INPUT",
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  return invokeSleepSessionRpc("start_sleep_session", {
    p_baby_id: parsed.data.babyId,
    p_type: parsed.data.type,
  });
}

export async function pauseSleepSessionAction(
  input: SleepSessionCommandInput
): Promise<SleepSessionActionResult> {
  const parsed = sleepSessionCommandSchema.safeParse(input);
  if (!parsed.success) {
    return buildErrorResult(
      "INVALID_INPUT",
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  return invokeSleepSessionRpc("pause_sleep_session", {
    p_baby_id: parsed.data.babyId,
  });
}

export async function resumeSleepSessionAction(
  input: SleepSessionCommandInput
): Promise<SleepSessionActionResult> {
  const parsed = sleepSessionCommandSchema.safeParse(input);
  if (!parsed.success) {
    return buildErrorResult(
      "INVALID_INPUT",
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  return invokeSleepSessionRpc("resume_sleep_session", {
    p_baby_id: parsed.data.babyId,
  });
}

export async function cancelSleepSessionAction(
  input: SleepSessionCommandInput
): Promise<SleepSessionActionResult> {
  const parsed = sleepSessionCommandSchema.safeParse(input);
  if (!parsed.success) {
    return buildErrorResult(
      "INVALID_INPUT",
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  return invokeSleepSessionRpc("cancel_sleep_session", {
    p_baby_id: parsed.data.babyId,
  });
}

export async function completeSleepSessionAction(
  input: CompleteSleepSessionInput
): Promise<SleepSessionActionResult> {
  const parsed = completeSleepSessionSchema.safeParse(input);
  if (!parsed.success) {
    return buildErrorResult(
      "INVALID_INPUT",
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  return invokeSleepSessionRpc("complete_sleep_session", {
    p_baby_id: parsed.data.babyId,
    p_notes: parsed.data.notes ?? null,
  });
}
