import type { StoreData } from "../dataContract";

export interface AssistantAiResult {
  ok: boolean;
  reply?: string;
  error?: string;
  reason?: "quota_exhausted" | "rate_limited" | "ai_unavailable";
  source?: "copilot";
}

const ENDPOINTS = [
  "/api/assistant/chat",
  "http://127.0.0.1:3001/api/assistant/chat",
];

/**
 * Calls the local isolated WiTECH Assistant service powered by Copilot SDK.
 * Handles timeouts, network failures, quota limits, and public context safely.
 */
export async function fetchCopilotAiResponse(
  message: string,
  publicData: StoreData | null,
  timeoutMs = 15000
): Promise<AssistantAiResult> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { ok: false, error: "Pesan tidak boleh kosong." };
  }

  if (trimmed.length > 500) {
    return { ok: false, error: "Pesan melebihi batas 500 karakter." };
  }

  // Package only public non-sensitive data
  const publicContext = {
    divisions: publicData?.divisions?.map((d) => ({
      name: d.name,
      shortName: d.shortName,
      description: d.description,
      technologies: d.technologies,
    })) || [],
    projects: publicData?.projects?.filter((p) => p.status === "published").slice(0, 5).map((p) => ({
      title: p.title,
      year: p.year,
      tags: p.tags,
      subtitle: p.subtitle,
      description: p.description,
    })) || [],
  };

  const payload = JSON.stringify({
    message: trimmed,
    publicContext,
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
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 429 / Quota Exhausted / Rate Limited -> DO NOT RETRY, return immediately
      if (res.status === 429) {
        let errData: any = null;
        try {
          errData = await res.json();
        } catch {
          // ignore
        }
        const reason: "quota_exhausted" | "rate_limited" =
          errData?.reason === "rate_limited" ? "rate_limited" : "quota_exhausted";
        return {
          ok: false,
          reason,
          error: "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
        };
      }

      if (!res.ok) {
        let errData: any = null;
        try {
          errData = await res.json();
        } catch {
          // ignore
        }
        if (errData?.reason === "quota_exhausted") {
          return {
            ok: false,
            reason: "quota_exhausted",
            error: "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
          };
        }
        // If 400 Bad Request, no need to retry another endpoint
        if (res.status === 400) {
          return { ok: false, error: errData?.error || "Permintaan tidak valid." };
        }
        continue;
      }

      const data = await res.json();
      if (data.ok && typeof data.reply === "string") {
        return {
          ok: true,
          reply: data.reply,
          source: "copilot",
        };
      }

      if (data.reason === "quota_exhausted") {
        return {
          ok: false,
          reason: "quota_exhausted",
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
