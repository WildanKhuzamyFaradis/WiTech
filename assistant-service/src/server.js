import http from "node:http";
import { CopilotBridge } from "./copilotBridge.js";

const PORT = parseInt(process.env.PORT || "3001", 10);
const bridge = new CopilotBridge({
  runtimeUrl: process.env.COPILOT_RUNTIME_URL || "localhost:4321",
});

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  // Health check endpoint
  if (req.method === "GET" && (url.pathname === "/health" || url.pathname === "/api/assistant/health")) {
    const health = await bridge.checkHealth();
    sendJson(res, health.ok ? 200 : 503, {
      status: health.ok ? "ok" : "degraded",
      copilotRuntime: "localhost:4321",
      copilotConnected: health.ok,
      mode: "empty",
      tools: "none",
      detail: health,
    });
    return;
  }

  // Chat endpoint
  if (req.method === "POST" && (url.pathname === "/api/assistant/chat" || url.pathname === "/chat")) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      // Prevent payload flood
      if (body.length > 50000) {
        req.destroy();
      }
    });

    req.on("end", async () => {
      try {
        const payload = JSON.parse(body || "{}");
        const rawMessage = typeof payload.message === "string" ? payload.message.trim() : "";

        if (!rawMessage) {
          sendJson(res, 400, { ok: false, error: "Pesan tidak boleh kosong." });
          return;
        }

        // Enforce max 500 characters
        if (rawMessage.length > 500) {
          sendJson(res, 400, { ok: false, error: "Pesan melebihi batas maksimal 500 karakter." });
          return;
        }

        const publicContext = payload.publicContext || {};

        // Forward to Copilot SDK bridge
        const reply = await bridge.ask({
          message: rawMessage,
          publicContext,
        });

        sendJson(res, 200, {
          ok: true,
          reply,
          source: "copilot",
        });
      } catch (err) {
        console.error("Assistant service error:", err);
        const errMsg = err instanceof Error ? err.message : String(err);

        let reason = "ai_unavailable";
        let statusCode = 503;

        if (/resource_exhausted|quota exceeded|insufficient_quota|quota/i.test(errMsg)) {
          reason = "quota_exhausted";
          statusCode = 429;
        } else if (/429|rate limit|too many requests/i.test(errMsg)) {
          reason = "rate_limited";
          statusCode = 429;
        }

        sendJson(res, statusCode, {
          ok: false,
          reason,
          error: "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia.",
          detail: errMsg,
        });
      }
    });
    return;
  }

  // 404 for unknown endpoints
  sendJson(res, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[WiTECH Assistant Service] Listening on http://127.0.0.1:${PORT}`);
  console.log(`[WiTECH Assistant Service] Connected to Copilot runtime at localhost:4321 (mode: empty)`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down Assistant Service...");
  await bridge.close();
  server.close(() => process.exit(0));
});

process.on("SIGTERM", async () => {
  await bridge.close();
  server.close(() => process.exit(0));
});
