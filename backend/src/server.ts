import { createServer } from "node:http";
import { env } from "./config/env.js";
import { handleRequest } from "./app.js";

const server = createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    console.error("Fatal error handling request:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { code: "INTERNAL_ERROR", message: "Unexpected server error." } }));
    }
  });
});

server.listen(env.port, () => {
  console.log(`witech-backend listening on http://localhost:${env.port} (env: ${env.nodeEnv})`);
  console.log(`API base: http://localhost:${env.port}/api/v1`);
});
