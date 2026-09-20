import type { StoreData } from "../dataContract";

export interface AssistantAiResult {
  ok: boolean;
  reply?: string;
  error?: string;
  reason?:
    | "quota_exhausted"
    | "rate_limited"
    | "ai_unavailable"
    | "out_of_scope"
    | "deterministic_preferred"
    | "request_in_progress"
    | "invalid_request";
  source?: "copilot";
}

const ENDPOINTS = ["/api/assistant/chat"];

/**
 * Calls the local isolated WiTECH Assistant service powered by Copilot SDK.
 * Sends ONLY message; public context is safely managed server-side.
 */
export async function fetchCopilotAiResponse(
  message: string,
  _publicData?: unknown,
  timeoutMs = 15000
): Promise<AssistantAiResult> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { ok: false, error: "Pesan tidak boleh kosong." };
  }

  if (trimmed.length > 500) {
    return { ok: false, error: "Pesan melebihi batas 500 karakter." };
  }

  if (import.meta.env.VITE_ASSISTANT_AI_ENABLED !== "true") {
    return {
      ok: false,
      reason: "ai_unavailable",
      error: "Fitur rekomendasi pintar belum tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
    };
  }

  // Send ONLY message to server; server builds its own trusted context
  const payload = JSON.stringify({
    message: trimmed,
  });

  // Try endpoint with timeout; DO NOT retry if status is 429 (quota/rate limit)
  for (const endpoint of ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // ignore JSON parse error
      }

      // 429 / Quota Exhausted / Rate Limited / Request In Progress -> DO NOT RETRY
      if (res.status === 429) {
        if (data?.reason === "request_in_progress") {
          return {
            ok: false,
            reason: "request_in_progress",
            error: data?.error || "Permintaan sedang diproses. Mohon tunggu sebentar ya.",
          };
        }
        if (data?.reason === "rate_limited") {
          return {
            ok: false,
            reason: "rate_limited",
            error: "Kamu sudah cukup banyak menggunakan fitur jawaban pintar. Coba lagi sebentar.",
          };
        }
        return {
          ok: false,
          reason: "quota_exhausted",
          error: "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
        };
      }

      if (!res.ok) {
        if (res.status === 400) {
          return {
            ok: false,
            reason: "invalid_request",
            error: data?.error || "Permintaan tidak valid.",
          };
        }
        if (data?.reason === "quota_exhausted" || data?.reason === "ai_unavailable") {
          return {
            ok: false,
            reason: data.reason,
            error: "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
          };
        }
        continue;
      }

      // 200 OK: success or scope gate result
      if (data?.ok && typeof data.reply === "string") {
        return {
          ok: true,
          reply: data.reply,
          source: "copilot",
        };
      }

      if (data?.reason === "out_of_scope" || data?.reason === "deterministic_preferred") {
        return {
          ok: false,
          reason: data.reason,
          error: data?.error || "Pertanyaan di luar cakupan asisten.",
        };
      }

      if (data?.reason === "quota_exhausted" || data?.reason === "ai_unavailable") {
        return {
          ok: false,
          reason: data.reason,
          error: "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
        };
      }
    } catch {
      clearTimeout(timeoutId);
      // Try next endpoint only if fetch threw connection error
      continue;
    }
  }

  return {
    ok: false,
    reason: "ai_unavailable",
    error: "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
  };
}
