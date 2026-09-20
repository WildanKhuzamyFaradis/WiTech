import http from "node:http";
import { Resend } from "resend";
import { CopilotBridge } from "./copilotBridge.js";
import { getPublicWiTechData, buildMinimalContext } from "./publicData.js";
import {
  checkRateLimits,
  recordRequest,
  acquireSessionLock,
  releaseSessionLock,
} from "./rateLimiter.js";
import { getOrCreateSession } from "./session.js";
import { copilotCircuitBreaker } from "./circuitBreaker.js";

const PORT = parseInt(process.env.PORT || "3001", 10);
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Configure allowed CORS origins
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:8443",
  "http://localhost:8444",
  "http://127.0.0.1:8443",
  "http://127.0.0.1:8444",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const CUSTOM_ORIGIN = process.env.WITECH_ALLOWED_ORIGIN || process.env.ALLOWED_ORIGIN;
const ALLOWED_ORIGINS = new Set(
  CUSTOM_ORIGIN
    ? [...DEFAULT_ALLOWED_ORIGINS, ...CUSTOM_ORIGIN.split(",").map((s) => s.trim())]
    : DEFAULT_ALLOWED_ORIGINS
);

const bridge = new CopilotBridge();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const contactAttempts = new Map();
const CONTACT_WINDOW_MS = 15 * 60 * 1000;
const CONTACT_LIMIT = 5;

function allowContact(ip) {
  const now = Date.now();
  const recent = (contactAttempts.get(ip) || []).filter((time) => now - time < CONTACT_WINDOW_MS);
  if (recent.length >= CONTACT_LIMIT) {
    contactAttempts.set(ip, recent);
    return false;
  }
  recent.push(now);
  contactAttempts.set(ip, recent);
  return true;
}

function contactText({ name, email, subject, message }) {
  return `Nama: ${name}\nEmail: ${email}\nSubjek: ${subject || "Pesan dari Website"}\n\nPesan:\n${message}`;
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}

function handleCors(req, res) {
  const origin = req.headers.origin;

  // If no origin header (e.g. server-to-server or same-origin direct request without Origin header), allow
  if (!origin) {
    return true;
  }

  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return true;
  }

  // Origin is not allowed
  return false;
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

export const server = http.createServer(async (req, res) => {
  const originAllowed = handleCors(req, res);

  // Reject unknown origins if Origin header was supplied
  if (req.headers.origin && !originAllowed) {
    sendJson(res, 403, { ok: false, reason: "invalid_request", error: "Origin not allowed." });
    return;
  }

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  // Health endpoint: keep minimal, do not leak tokens, users, or DB credentials
  if (req.method === "GET" && (url.pathname === "/health" || url.pathname === "/api/assistant/health")) {
    sendJson(res, 200, {
      ok: true,
      service: "witech-assistant",
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/contact") {
    const clientIp = getClientIp(req);
    if (!handleCors(req, res)) return sendJson(res, 403, { ok: false, error: "Origin not allowed." });
    if (!(req.headers["content-type"] || "").includes("application/json")) {
      return sendJson(res, 400, { ok: false, error: "Format permintaan tidak valid." });
    }
    if (!allowContact(clientIp)) return sendJson(res, 429, { ok: false, error: "Terlalu banyak pesan. Coba lagi nanti." });
    let body = "";
    let tooLarge = false;
    req.on("data", (chunk) => { body += chunk; if (body.length > 16000) { tooLarge = true; req.destroy(); } });
    req.on("end", async () => {
      if (tooLarge) return sendJson(res, 413, { ok: false, error: "Payload terlalu besar." });
      let payload;
      try { payload = JSON.parse(body || "{}"); } catch { return sendJson(res, 400, { ok: false, error: "Format permintaan tidak valid." }); }
      const name = typeof payload.name === "string" ? payload.name.trim() : "";
      const email = typeof payload.email === "string" ? payload.email.trim() : "";
      const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
      const message = typeof payload.message === "string" ? payload.message.trim() : "";
      if (payload.website) return sendJson(res, 200, { ok: true });
      if (!name || name.length > 100 || !email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || subject.length > 150 || !message || message.length > 3000) {
        return sendJson(res, 400, { ok: false, error: "Periksa kembali data formulir." });
      }
      if (!resend) return sendJson(res, 503, { ok: false, error: "Layanan pesan sedang tidak tersedia." });
      try {
        const result = await resend.emails.send({
          from: process.env.CONTACT_FROM_EMAIL || "WiTECH Website <noreply@witech.id>",
          to: process.env.CONTACT_TO_EMAIL || "contact@witech.id",
          replyTo: email,
          subject: `[WiTECH Contact] ${subject || "Pesan dari Website"}`,
          text: contactText({ name, email, subject, message }),
        });
        if (result.error) throw new Error("resend_failed");
        sendJson(res, 200, { ok: true });
      } catch { sendJson(res, 503, { ok: false, error: "Pesan belum dapat dikirim. Coba lagi nanti." }); }
    });
    return;
  }

  // Chat endpoint
  if (req.method === "POST" && (url.pathname === "/api/assistant/chat" || url.pathname === "/chat")) {
    // 1. Content-Type check
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      sendJson(res, 400, {
        ok: false,
        reason: "invalid_request",
        error: "Content-Type harus application/json.",
      });
      return;
    }

    // 2. Anonymous session cookie check / creation
    const sessionId = getOrCreateSession(req, res, IS_PRODUCTION);
    const clientIp = getClientIp(req);

    // 3. Body size limit (max 10KB to prevent memory floods)
    let body = "";
    let bodyTooLarge = false;

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10240) {
        bodyTooLarge = true;
        req.destroy();
      }
    });

    req.on("end", async () => {
      if (bodyTooLarge) {
        sendJson(res, 413, {
          ok: false,
          reason: "invalid_request",
          error: "Payload terlalu besar.",
        });
        return;
      }

      // Parse JSON body
      let payload;
      try {
        payload = JSON.parse(body || "{}");
      } catch {
        sendJson(res, 400, {
          ok: false,
          reason: "invalid_request",
          error: "Format JSON tidak valid.",
        });
        return;
      }

      const rawMessage = typeof payload.message === "string" ? payload.message.trim() : "";

      // Enforce non-empty message
      if (!rawMessage) {
        sendJson(res, 400, {
          ok: false,
          reason: "invalid_request",
          error: "Pesan tidak boleh kosong.",
        });
        return;
      }

      // Enforce max 500 chars
      if (rawMessage.length > 500) {
        sendJson(res, 400, {
          ok: false,
          reason: "invalid_request",
          error: "Pesan melebihi batas maksimal 500 karakter.",
        });
        return;
      }

      // 4. Concurrency Guard: 1 active AI request per session
      const lockAcquired = acquireSessionLock(sessionId);
      if (!lockAcquired) {
        sendJson(res, 429, {
          ok: false,
          reason: "request_in_progress",
          error: "Permintaan sedang diproses. Mohon tunggu.",
        });
        return;
      }

      // 6. Copilot Circuit Breaker Check (if circuit is open, return 503 immediately)
      if (copilotCircuitBreaker.isOpen()) {
        releaseSessionLock(sessionId);
        const status = copilotCircuitBreaker.getStatus();
        const reason = status.reason || "ai_unavailable";
        sendJson(res, 503, {
          ok: false,
          reason,
          error: "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
        });
        return;
      }

      // 7. Rate Limiting: 2 dimensions (Session + IP) + burst
      const rateCheck = checkRateLimits({ sessionId, ip: clientIp });
      if (rateCheck.limited) {
        releaseSessionLock(sessionId);
        sendJson(res, 429, {
          ok: false,
          reason: "rate_limited",
          retryAfter: rateCheck.retryAfter,
          error: "Kamu sudah cukup banyak menggunakan fitur jawaban pintar. Coba lagi sebentar.",
        });
        return;
      }

      // Record this valid request in rate limit history
      recordRequest({ sessionId, ip: clientIp });

      try {
        // 8. Server-side Supabase Public Context (NEVER trust payload.publicContext)
        const publicData = await getPublicWiTechData();
        const minimalContext = buildMinimalContext(rawMessage, publicData);

        // 9. Forward to Copilot Bridge
        const reply = await bridge.ask({
          message: rawMessage,
          systemContext: minimalContext,
          validDivisions: publicData.divisions || [],
          sessionId,
        });

        // Success: release lock and return reply
        releaseSessionLock(sessionId);
        sendJson(res, 200, {
          ok: true,
          reply,
          source: "copilot",
        });
      } catch (err) {
        releaseSessionLock(sessionId);
        console.error("[AssistantService] AI call error:", err.message);

        const errMsg = err instanceof Error ? err.message : String(err);
        let reason = "ai_unavailable";
        let statusCode = 503;

        if (/resource_exhausted|quota exceeded|insufficient_quota|quota/i.test(errMsg)) {
          reason = "quota_exhausted";
          statusCode = 429;
          copilotCircuitBreaker.trip("quota_exhausted");
        } else if (/429|rate limit|too many requests/i.test(errMsg)) {
          reason = "rate_limited";
          statusCode = 429;
          copilotCircuitBreaker.trip("rate_limited");
        } else if (errMsg === "unsupported_grounding") {
          reason = "ai_unavailable";
          statusCode = 200;
        }

        sendJson(res, statusCode, {
          ok: false,
          reason,
          error: "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
        });
      }
    });
    return;
  }

  // 404 for unknown endpoints
  sendJson(res, 404, { ok: false, reason: "invalid_request", error: "Not found" });
});

// If run directly via node src/server.js
if (process.argv[1] && process.argv[1].endsWith("server.js")) {
  const HOST = IS_PRODUCTION ? "0.0.0.0" : (process.env.HOST || "127.0.0.1");
  server.listen(PORT, HOST, () => {
    console.log(`[WiTECH Assistant Service] Listening on http://${HOST}:${PORT}`);
    console.log(`[WiTECH Assistant Service] Mode: empty, Trusted Server Context: active`);
  });

  process.on("SIGINT", async () => {
    console.log("\nShutting down Assistant Service...");
    await bridge.close();
    server.close(() => process.exit(0));
  });

  process.on("SIGTERM", async () => {
    await bridge.close();
    server.close(() => process.exit(0));
  });
}
