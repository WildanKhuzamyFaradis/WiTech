const MAX_BODY_BYTES = 10 * 1024;
const TIMEOUT_MS = 35 * 1000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      ok: false,
      reason: "invalid_request",
      error: "Method not allowed."
    });
  }
  const backend = (process.env.WITECH_BACKEND_URL || "").trim().replace(/\/+$/, "");
  if (!backend) return res.status(502).json({
    ok: false,
    reason: "ai_unavailable",
    error: "Fitur jawaban pintar sedang tidak tersedia."
  });
  try {
    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) return res.status(413).json({
      ok: false,
      reason: "invalid_request",
      error: "Payload terlalu besar."
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const upstream = await fetch(`http://api.witech.eu.cc:2072/api/assistant/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: rawBody,
      signal: controller.signal
    });
    clearTimeout(timeout);
    const text = await upstream.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = {
        ok: false,
        reason: "ai_unavailable",
        error: "Fitur jawaban pintar sedang tidak tersedia."
      };
    }
    return res.status(upstream.status).json(payload);
  } catch {
    return res.status(502).json({
      ok: false,
      reason: "ai_unavailable",
      error: "Fitur jawaban pintar sedang tidak tersedia."
    });
  }
}