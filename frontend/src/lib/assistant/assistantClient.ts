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
  source?: "assistant-api";
}

const ENDPOINT = "http://api.witech.eu.cc:2072/api/assistant/chat";

/**
 * Calls the external WiTECH Assistant API.
 * Sends only the user's message to the independent assistant service.
 */
export async function fetchAssistantResponse(
  message: string,
  _publicData?: unknown,
  timeoutMs = 30000
): Promise<AssistantAiResult> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { ok: false, error: "Pesan tidak boleh kosong." };
  }

  if (trimmed.length > 500) {
    return { ok: false, error: "Pesan melebihi batas 500 karakter." };
  }

  const payload = JSON.stringify({
    message: trimmed,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "omit",
      body: payload,
      signal: controller.signal,
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // ignore JSON parse error
    }

    console.log("Assistant API status:", res.status);
    console.log("Assistant API response:", data);

    clearTimeout(timeoutId);

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
    }

    if (data?.ok && typeof data.reply === "string") {
      return {
        ok: true,
        reply: data.reply,
        source: "assistant-api",
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

    return {
      ok: false,
      reason: "ai_unavailable",
      error: "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Assistant API fetch error:", error);
    return {
      ok: false,
      reason: "ai_unavailable",
      error: "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
    };
  }
}
