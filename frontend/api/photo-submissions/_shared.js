import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

export const BUCKET = "member-submissions";
export const MAX_BYTES = 5 * 1024 * 1024;
export const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
export const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const service = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

export function json(res, status, body) { return res.status(status).json(body); }
export function slug(value) { return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-").slice(0, 80) || "member"; }
export function validHttpsUrl(value, host) { if (!value) return null; try { const url = new URL(value); return url.protocol === "https:" && (url.hostname === host || url.hostname === `www.${host}`) ? url.toString() : null; } catch { return null; } }
export function id() { return crypto.randomUUID(); }
export function isJsonRequest(req) { return String(req.headers["content-type"] || "").toLowerCase().split(";")[0] === "application/json"; }
export function readJsonBody(req) {
  if (!isJsonRequest(req)) throw new Error("invalid_content_type");
  if (req.body === undefined || req.body === null) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  if (typeof req.body !== "object" || Array.isArray(req.body)) throw new Error("invalid_json");
  return req.body;
}
export function missingConfigLabels() { return [!supabaseUrl ? "supabase_url" : null, !serviceRoleKey ? "service_role" : null].filter(Boolean); }
export function configMissing() { return missingConfigLabels().length > 0; }
export function logSafeError(scope, error) { console.error(`[photo-submissions/${scope}]`, { name: error?.name, message: error?.message }); }

const rateContext = "witech-photo-submission-rate-limit-v1";
export function deriveRateLimitKey(key = serviceRoleKey) { return key ? crypto.createHmac("sha256", key).update(rateContext).digest() : null; }
export function sourceHashForSource(source, key = serviceRoleKey) { const derivedKey = deriveRateLimitKey(key); return derivedKey ? crypto.createHmac("sha256", derivedKey).update(source).digest("hex") : null; }
export function sourceHash(req) { const source = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown"; return sourceHashForSource(source); }
export async function consumeSubmissionRate(req) {
  if (!service || !serviceRoleKey) return { allowed: false, unavailable: true };
  const hash = sourceHash(req);
  if (!hash) return { allowed: false, unavailable: true };
  const { data, error } = await service.rpc("consume_photo_submission_rate", { p_source_hash: hash, p_limit: 5 });
  if (error) { logSafeError("rate-limit", error); return { allowed: false, unavailable: true }; }
  return { allowed: data === true, unavailable: false };
}

export function signature(buffer) { if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "image/jpeg"; if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png"; if (buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") return "image/webp"; return null; }
export async function requireAdmin(req) {
  if (!service) return false;
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return false;
  const { data: userData, error: userError } = await service.auth.getUser(header.slice(7));
  if (userError || !userData.user) {
    logSafeError("admin-auth", userError || new Error("user_not_found"));
    return false;
  }
  const { data: admin, error: adminError } = await service.from("admin_users").select("user_id").eq("user_id", userData.user.id).maybeSingle();
  if (adminError) {
    logSafeError("admin-allowlist", adminError);
    return false;
  }
  return Boolean(admin);
}
