import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const url = process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = url && serviceRoleKey ? createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null;

function source(req) { return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown"; }
export function sourceHash(req, namespace) {
  if (!serviceRoleKey) return null;
  const derived = crypto.createHmac("sha256", serviceRoleKey).update(`witech-${namespace}-rate-limit-v1`).digest();
  return crypto.createHmac("sha256", derived).update(source(req)).digest("hex");
}
export async function consumeRateLimit(req, namespace, limit, windowSeconds) {
  const hash = sourceHash(req, namespace);
  if (!supabase || !hash) return { allowed: false, unavailable: true };
  const { data, error } = await supabase.rpc("consume_public_rate_limit", { p_namespace: namespace, p_source_hash: hash, p_limit: limit, p_window_seconds: windowSeconds });
  if (error) { console.error(`[rate-limit/${namespace}]`, { name: error.name, message: error.message }); return { allowed: false, unavailable: true }; }
  return { allowed: data === true, unavailable: false };
}
