# WiTECH Assistant Service (Phase B2)

Isolated Node.js microservice powering the hybrid WiTECH Assistant via the official `@github/copilot-sdk`.

## Architecture & Security Model

1. **Untrusted Browser Input**:
   - The browser sends ONLY `{ "message": "..." }`.
   - Any client-supplied `publicContext` is completely ignored.
   - Trusted public facts (divisions, published projects, active members, FAQs) are fetched directly from Supabase via server-side REST API with public anon credentials and 45s in-memory caching.
   - Grounding check rejects any reply mentioning fictitious divisions.

2. **Scope Gate & Concurrency Control**:
   - Server evaluates query scope before invoking Copilot.
   - Out-of-scope requests (programming code generation, malware, school homework, politics, world trivia, prompt injections) return `{ ok: false, reason: "out_of_scope" }` with 0 AI calls.
   - Deterministic-preferred queries (simple FAQ / contact / division listing) return `{ ok: false, reason: "deterministic_preferred" }`.
   - Concurrency lock ensures only 1 active AI request per anonymous session (`request_in_progress`).

3. **Rate Limiting & Circuit Breaker**:
   - 2-dimensional rate limiting: 5 requests / 10 min per session, 10 requests / 10 min per IP, and 5 requests / 2s global burst.
   - Circuit breaker trips on `quota_exhausted` (5 min cooldown) and `rate_limited` (30s cooldown) to protect Copilot runtime.

4. **Copilot Headless Runtime & Connection Token**:
   - **Environment Variable**: `COPILOT_CONNECTION_TOKEN`
   - **How it works**:
     - `assistant-service` reads `COPILOT_CONNECTION_TOKEN` and passes it via `RuntimeConnection.forUri(url, { connectionToken })`.
     - **Production requirement**: If `NODE_ENV === "production"`, `assistant-service` will refuse to start / connect if `COPILOT_CONNECTION_TOKEN` is missing.
     - **Copilot CLI Runtime pairing**: The headless Copilot runtime daemon (`localhost:4321`) MUST be started with the **SAME** token (e.g. `COPILOT_CONNECTION_TOKEN=<token> copilot --headless --port 4321` or equivalent).
     - For local development, it remains optional.
   - **Permissions / Mode**: Always runs in `mode: "empty"` with `ToolSet()` (no shell, no filesystem, no git, no browser, no MCP, no SQL, no write tools).
