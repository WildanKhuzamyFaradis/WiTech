import test from "node:test";
import assert from "node:assert/strict";
import { deriveRateLimitKey, readJsonBody, signature, sourceHashForSource, validHttpsUrl } from "../api/photo-submissions/_shared.js";

const request = (body, contentType = "application/json") => ({ headers: { "content-type": contentType }, body, socket: { remoteAddress: "test" } });
const response = () => { const out = {}; return { status(code) { out.status = code; return this; }, json(body) { out.body = body; return out; }, out }; };

test("rejects malformed JSON and unsupported content type", () => {
  assert.throws(() => readJsonBody(request("{")), /invalid|JSON/i);
  assert.throws(() => readJsonBody(request({}, "text/plain")), /content_type/i);
});

test("accepts only object JSON bodies", () => {
  assert.deepEqual(readJsonBody(request({ name: "A" })), { name: "A" });
  assert.throws(() => readJsonBody(request([])), /invalid_json/);
});

test("detects real JPEG, PNG and WEBP signatures and rejects SVG", () => {
  assert.equal(signature(Buffer.from([0xff, 0xd8, 0xff, 0x00])), "image/jpeg");
  assert.equal(signature(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), "image/png");
  const webp = Buffer.alloc(12); webp.write("RIFF"); webp.write("WEBP", 8); assert.equal(signature(webp), "image/webp");
  assert.equal(signature(Buffer.from("<svg></svg>")), null);
});

test("allows only HTTPS social URLs on their matching host", () => {
  assert.ok(validHttpsUrl("https://linkedin.com/in/name", "linkedin.com"));
  assert.equal(validHttpsUrl("http://linkedin.com/in/name", "linkedin.com"), null);
  assert.equal(validHttpsUrl("https://evil.example/in/name", "linkedin.com"), null);
});

test("server source keeps storage paths server generated and reject does not remove objects", async () => {
  const fs = await import("node:fs/promises");
  const create = await fs.readFile(new URL("../api/photo-submissions/create.js", import.meta.url), "utf8");
  const reject = await fs.readFile(new URL("../api/photo-submissions/reject.js", import.meta.url), "utf8");
  assert.match(create, /pending\/\$\{slug\(name\)\}--\$\{submissionId\}/);
  assert.doesNotMatch(reject, /storage\.from\(BUCKET\)\.remove/);
});
test("API enforces upload MIME, size and division checks", async () => {
  const fs = await import("node:fs/promises");
  const create = await fs.readFile(new URL("../api/photo-submissions/create.js", import.meta.url), "utf8");
  const finalize = await fs.readFile(new URL("../api/photo-submissions/finalize.js", import.meta.url), "utf8");
  assert.match(create, /TYPES\.has\(type\)/);
  assert.match(create, /size > 5 \* 1024 \* 1024/);
  assert.match(create, /from\("divisions"\)/);
  assert.match(finalize, /signature\(buffer\)/);
  assert.match(finalize, /normalized\.length > MAX_BYTES/);
});

test("finalize is path-bound, idempotent and claim-protected", async () => {
  const fs = await import("node:fs/promises");
  const finalize = await fs.readFile(new URL("../api/photo-submissions/finalize.js", import.meta.url), "utf8");
  assert.match(finalize, /storage_path/);
  assert.match(finalize, /status !== "uploading"/);
  assert.match(finalize, /eq\("status", "uploading"\)/);
  assert.match(finalize, /status: "processing"/);
  assert.match(finalize, /remove\(\[finalPath\]\)/);
});

test("admin promotion validates member and rolls back processing state", async () => {
  const fs = await import("node:fs/promises");
  const use = await fs.readFile(new URL("../api/photo-submissions/use.js", import.meta.url), "utf8");
  assert.match(use, /from\("members"\)/);
  assert.match(use, /if \(!member\)/);
  assert.match(use, /eq\("status", "pending"\)/);
  assert.match(use, /status: "processing"/);
  assert.match(use, /status: "used"/);
  assert.match(use, /restorePending/);
});

test("rejected and used submissions cannot be promoted", async () => {
  const fs = await import("node:fs/promises");
  const use = await fs.readFile(new URL("../api/photo-submissions/use.js", import.meta.url), "utf8");
  const reject = await fs.readFile(new URL("../api/photo-submissions/reject.js", import.meta.url), "utf8");
  assert.match(use, /eq\("status", "pending"\)/);
  assert.match(reject, /status: "rejected"/);
  assert.doesNotMatch(reject, /\.remove\(/);
});
test("rate limiter derives a deterministic non-reversible source hash from the service key", async () => {
  const key = "server-only-service-role-key";
  const first = sourceHashForSource("203.0.113.10", key);
  const second = sourceHashForSource("203.0.113.10", key);
  const other = sourceHashForSource("203.0.113.11", key);
  assert.equal(first, second);
  assert.notEqual(first, other);
  assert.notEqual(first, "203.0.113.10");
  assert.notEqual(first, key);
  assert.ok(Buffer.isBuffer(deriveRateLimitKey(key)));
  assert.equal(sourceHashForSource("203.0.113.10", ""), null);
  const fs = await import("node:fs/promises");
  const shared = await fs.readFile(new URL("../api/photo-submissions/_shared.js", import.meta.url), "utf8");
  const removedName = ["PHOTO", "SUBMISSION", "RATE", "LIMIT", "SECRET"].join("_");
  assert.doesNotMatch(shared, new RegExp(removedName));
  assert.match(shared, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(shared, /attempts = new Map/);
});
test("create handler follows the Vercel req/res contract", async () => {
  const { default: handler } = await import("../api/photo-submissions/create.js");
  const calls = [];
  const res = { setHeader(name, value) { calls.push([name, value]); }, status(code) { calls.push(["status", code]); return this; }, json(body) { calls.push(["json", body]); return this; } };
  await handler({ method: "GET", headers: {}, body: {} }, res);
  assert.deepEqual(calls[0], ["Allow", "POST"]);
  assert.equal(calls[1][1], 405);
});

test("create returns a safe configuration reason when server credentials are absent", async () => {
  const { default: handler } = await import("../api/photo-submissions/create.js");
  let payload;
  const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { payload = body; return this; } };
  await handler({ method: "POST", headers: { "content-type": "application/json" }, body: {} }, res);
  assert.equal(res.code, 500);
  assert.equal(payload.reason, "server_config");
  assert.doesNotMatch(JSON.stringify(payload), /SUPABASE_SERVICE_ROLE_KEY/);
});

