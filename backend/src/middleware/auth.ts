import type { RequestContext } from "../core/types.js";
import { sendError } from "../core/http.js";

/**
 * Guard for admin routes. Right now this only checks that a
 * "Authorization: Bearer <token>" header is present and well-formed —
 * it does NOT verify the token's signature/expiry yet.
 *
 * TODO once auth logic is implemented:
 *  - verify JWT signature with env.jwtSecret (e.g. via `jsonwebtoken` or `jose`)
 *  - check expiry, reject revoked/refresh-only tokens
 *  - attach decoded admin id/role to ctx.auth instead of the raw token
 *
 * Usage in a route handler:
 *   if (!requireAuth(ctx)) return; // response already sent (401)
 */
export function requireAuth(ctx: RequestContext): boolean {
  const header = ctx.req.headers["authorization"];

  if (!header || Array.isArray(header) || !header.startsWith("Bearer ")) {
    sendError(ctx.res, 401, "UNAUTHORIZED", "Missing or malformed Authorization header.");
    return false;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    sendError(ctx.res, 401, "UNAUTHORIZED", "Missing bearer token.");
    return false;
  }

  ctx.auth = { token };
  return true;
}
