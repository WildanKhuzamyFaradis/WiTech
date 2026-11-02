export interface AssistantAiResult {
  ok: boolean

  reply?: string

  error?: string

  reason?: "quota_exhausted" | "rate_limited" | "ai_unavailable" | "out_of_scope" | "deterministic_preferred" | "request_in_progress" | "invalid_request"

  source?: "assistant-api"
}

const SYSTEM_PROMPT = `Kamu adalah WiTECH Assistant, asisten virtual resmi untuk WiTECH (Unit Kegiatan Mahasiswa / komunitas teknologi di kampus).
Tugasmu adalah menjawab pertanyaan pengguna secara ramah, santun, jelas, dan ringkas (2-4 kalimat).
Fokus utamamu adalah informasi seputar WiTECH: divisi, program kerja, proyek, kegiatan/event, cara bergabung, dan kontak.

Informasi Divisi WiTECH:
1. WiTECH Academy: Pusat pembelajaran, workshop, bootcamp, dan mentoring teknologi & soft skill (terbuka dari pemula hingga mahir).
2. WiTECH Lab: Inkubator proyek kolaboratif, riset aplikasi/software, dan eksperimen teknologi untuk kampus dan masyarakat.
3. WiTECH Creative: Menangani identitas visual, UI/UX desain grafis, multimedia, konten kreatif, dan media sosial.
4. WiTECH Connect: Hubungan masyarakat, kemitraan sponsorship, publikasi event, dan jejaring komunitas.
5. WiTECH Research: Analisis data, riset teknologi masa depan, inovasi, dan solusi berbasis data nyata.

Panduan menjawab:
- Jawab dalam Bahasa Indonesia yang ramah dan membantu.
- WiTECH terbuka untuk semua mahasiswa dari berbagai jurusan (tidak harus IT).
- Jika pengguna bertanya tentang topik di luar WiTECH (misal tugas kuliah, politik, hacking/malware, pembuatan kode pemrograman umum tanpa kaitan WiTECH), tolak dengan santun dan sampaikan bahwa kamu khusus membantu informasi seputar WiTECH.
- Jangan mengarang fakta rahasia atau informasi yang tidak ada.

Informasi Tambahan
- Developer1: Irfan Hariyanto dari Divisi WiTECH Creative, Website: https://irfanhariyanto.my.id/, Github: https://github.com/rtwone
- Developer2: Wildan Khuzamy Faradis, Github: https://github.com/wildankhuzamyfaradis`

/**
 * Calls Apinex directly from the browser without going through the app backend.
 */

export async function fetchAssistantResponse(
  message: string,

  _publicData?: unknown,

  timeoutMs = 30000,
): Promise<AssistantAiResult> {
  const trimmed = message.trim()

  if (!trimmed) {
    return { ok: false, error: "Pesan tidak boleh kosong." }
  }

  if (trimmed.length > 500) {
    return { ok: false, error: "Pesan melebihi batas 500 karakter." }
  }

  const apiKey = (import.meta.env.VITE_APINEX_API_KEY || "").trim()

  const baseURL = (
    import.meta.env.VITE_APINEX_BASE_URL || "https://api.apinex.bond/v1"
  )
    .trim()
    .replace(/\/+$/, "")

  const model = (
    import.meta.env.VITE_APINEX_MODEL || "free/gemini-3.8-flash"
  ).trim()

  if (!apiKey) {
    return {
      ok: false,

      reason: "ai_unavailable",

      error:
        "Fitur jawaban pintar belum dikonfigurasi. Silakan masukkan VITE_APINEX_API_KEY.",
    }
  }

  const controller = new AbortController()

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },

      credentials: "omit",

      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: trimmed },
        ],
      }),

      signal: controller.signal,
    })

    let data: any = null

    try {
      data = await res.json()
    } catch {
      // ignore JSON parse error
    }

    clearTimeout(timeoutId)

    if (res.status === 429) {
      return {
        ok: false,

        reason: "rate_limited",

        error:
          "Kamu sudah cukup banyak menggunakan fitur jawaban pintar. Coba lagi sebentar.",
      }
    }

    if (!res.ok) {
      const apiError =
        data?.error?.message ||
        data?.message ||
        "Fitur jawaban pintar sedang tidak tersedia."

      return {
        ok: false,

        reason: "ai_unavailable",

        error: apiError,
      }
    }

    const reply = data?.choices?.[0]?.message?.content?.trim()

    if (reply) {
      return {
        ok: true,
        reply,
        source: "assistant-api",
      }
    }

    return {
      ok: false,

      reason: "ai_unavailable",

      error:
        "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
    }
  } catch (error) {
    clearTimeout(timeoutId)

    console.error("Assistant API fetch error:", error)

    return {
      ok: false,

      reason: "ai_unavailable",

      error:
        "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
    }
  }
}
