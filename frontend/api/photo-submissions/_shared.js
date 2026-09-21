import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

export const BUCKET = "member-submissions";
export const MAX_BYTES = 5 * 1024 * 1024;
export const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
export const service = supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
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

const rateSecret = process.env.PHOTO_SUBMISSION_RATE_LIMIT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "witech-photo-rate-limit";
function sourceHash(req) {
  const source = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  return crypto.createHmac("sha256", rateSecret).update(source).digest("hex");
}
export async function consumeSubmissionRate(req) {
  if (!service) return { allowed: false, unavailable: true };
  const { data, error } = await service.rpc("consume_photo_submission_rate", { p_source_hash: sourceHash(req), p_limit: 5 });
  if (error) return { allowed: false, unavailable: true };
  return { allowed: data === true, unavailable: false };
}

export function signature(buffer) { if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "image/jpeg"; if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png"; if (buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") return "image/webp"; return null; }
export async function requireAdmin(req) { if (!service) return false; const header = req.headers.authorization || ""; if (!header.startsWith("Bearer ")) return false; const { data } = await service.auth.getUser(header.slice(7)); if (!data.user) return false; const { data: admin } = await service.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle(); return Boolean(admin); }
