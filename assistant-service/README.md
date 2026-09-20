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

4. **Direct Copilot SDK runtime**:
   - The service starts one reusable `CopilotClient` in-process. It does not connect to `COPILOT_RUNTIME_URL` and does not require a runtime connection token.
   - `COPILOT_GITHUB_TOKEN` is a server-only runtime secret. It must be supplied through the deployment secret manager and is never sent to the browser or logged.
   - Sessions receive an isolated server-generated SDK session id and are disconnected after each request.
   - **Permissions / Mode**: Always runs in `mode: "empty"` with `ToolSet()` (no shell, no filesystem, no git, no browser, no MCP, no SQL, no write tools).

The `copilot-runtime/` directory is retained as historical deployment material only; it is not required by the current assistant service and should not be deployed alongside it.
