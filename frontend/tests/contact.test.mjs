import test from "node:test";
import assert from "node:assert/strict";

const load = () => import("../api/contact.js");
const makeRes = () => { const out = { headers: {}, code: 0, body: null }; return { setHeader(name, value) { out.headers[name] = value; }, status(code) { out.code = code; return this; }, json(body) { out.body = body; return this; }, out }; };
const req = (body, method = "POST") => ({ method, headers: { "content-type": "application/json" }, body, socket: { remoteAddress: "test" } });

test("contact accepts only POST", async () => { const { default: handler } = await load(); const res = makeRes(); await handler(req({}, "GET"), res); assert.equal(res.out.code, 405); assert.equal(res.out.headers.Allow, "POST"); });
test("contact rejects oversized body and invalid fields", async () => { const { default: handler } = await load(); let res = makeRes(); await handler(req({ name: "A", email: "a@example.com", subject: "ok", message: "x".repeat(17000) }), res); assert.equal(res.out.code, 413); res = makeRes(); await handler(req({ name: "Valid Name", email: "invalid", subject: "ok", message: "hello" }), res); assert.equal(res.out.code, 400); });
test("contact honeypot returns success without provider call", async () => { const { default: handler } = await load(); const res = makeRes(); await handler(req({ website: "bot", name: "Bot", email: "bot@example.com", subject: "hello", message: "hello" }), res); assert.equal(res.out.code, 200); assert.deepEqual(res.out.body, { success: true }); });
test("contact source limiter is namespaced and persistent", async () => { const fs = await import("node:fs/promises"); const helper = await fs.readFile(new URL("../api/_rateLimit.js", import.meta.url), "utf8"); const migration = await fs.readFile(new URL("../../supabase/migrations/20260921130000_public_rate_limits.sql", import.meta.url), "utf8"); assert.match(helper, /consume_public_rate_limit/); assert.match(helper, /witech-\$\{namespace\}-rate-limit-v1/); assert.match(migration, /PRIMARY KEY \(namespace, source_hash\)/); assert.match(migration, /GRANT EXECUTE.*service_role/s); assert.doesNotMatch(migration, /GRANT.*anon|GRANT.*authenticated/); });
