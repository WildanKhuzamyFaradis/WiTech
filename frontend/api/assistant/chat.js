import OpenAI from "openai"

const MAX_BODY_BYTES = 10 * 1024
const TIMEOUT_MS = 35 * 1000

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({
      ok: false,
      reason: "invalid_request",
      error: "Method not allowed.",
    })
  }

  let body
  try {
    const rawBody =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {})
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return res.status(413).json({
        ok: false,
        reason: "invalid_request",
        error: "Payload terlalu besar.",
      })
    }
    body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {})
  } catch {
    return res.status(400).json({
      ok: false,
      reason: "invalid_request",
      error: "Format JSON tidak valid.",
    })
  }

  const message = typeof body?.message === "string" ? body.message.trim() : ""
  if (!message) {
    return res.status(400).json({
      ok: false,
      reason: "invalid_request",
      error: "Pesan tidak boleh kosong.",
    })
  }

  if (message.length > 500) {
    return res.status(400).json({
      ok: false,
      reason: "invalid_request",
      error: "Pesan melebihi batas 500 karakter.",
    })
  }

  // Filter query out of scope
  if (
    /password|token|secret|hack|malware|politik|resep medis|tugas kuliah|buatkan kode/i.test(
      message,
    ) &&
    !/witech/i.test(message)
  ) {
    return res.status(200).json({
      ok: false,
      reason: "out_of_scope",
      error: "Aku khusus membantu informasi seputar WiTECH.",
    })
  }

  const apiKey = (process.env.APINEX_API_KEY || "").trim()
  const baseURL = (
    process.env.APINEX_BASE_URL || "https://api.apinex.bond/v1"
  ).trim()
  const model = (process.env.APINEX_MODEL || "free/gemini-3.8-flash").trim()

  // If APINEX_API_KEY is provided, use Apinex via OpenAI client
  if (apiKey) {
    try {
      const client = new OpenAI({
        apiKey,
        baseURL,
        timeout: TIMEOUT_MS,
      })

      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
      })

      const reply = completion.choices?.[0]?.message?.content?.trim()
      if (!reply) {
        return res.status(502).json({
          ok: false,
          reason: "ai_unavailable",
          error: "Tidak ada balasan dari asisten pintar.",
        })
      }

      return res.status(200).json({
        ok: true,
        reply,
        source: "assistant-api",
      })
    } catch (err) {
      console.error("[Apinex Assistant Error]:", err?.message || err)
      if (err?.status === 429) {
        return res.status(429).json({
          ok: false,
          reason: "rate_limited",
          error: "Terlalu banyak permintaan. Coba lagi sebentar.",
        })
      }
      return res.status(502).json({
        ok: false,
        reason: "ai_unavailable",
        error:
          "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
      })
    }
  }

  // Fallback to WITECH_BACKEND_URL if configured
  const backend = (process.env.WITECH_BACKEND_URL || "")
    .trim()
    .replace(/\/+$/, "")
  if (backend) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
      const upstream = await fetch(`${backend}/api/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const text = await upstream.text()
      let payload
      try {
        payload = JSON.parse(text)
      } catch {
        payload = {
          ok: false,
          reason: "ai_unavailable",
          error: "Fitur jawaban pintar sedang tidak tersedia.",
        }
      }
      return res.status(upstream.status).json(payload)
    } catch (error) {
      console.error("[Assistant Backend Proxy Error]:", error)
      return res.status(502).json({
        ok: false,
        reason: "ai_unavailable",
        error: "Fitur jawaban pintar sedang tidak tersedia.",
      })
    }
  }

  return res.status(502).json({
    ok: false,
    reason: "ai_unavailable",
    error:
      "Fitur jawaban pintar belum dikonfigurasi. Silakan atur APINEX_API_KEY di environment.",
  })
}
