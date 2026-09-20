/**
 * Anonymous session management for WiTECH Assistant.
 *
 * Uses cryptographically secure random session tokens stored in
 * HttpOnly, SameSite=Lax cookie.
 * No user login or persistent DB storage required.
 */

import crypto from "node:crypto";

export const COOKIE_NAME = "witech_ast_sid";
const SESSION_MAX_AGE_SEC = 24 * 60 * 60; // 24 hours

export function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;

  cookieHeader.split(";").forEach((cookie) => {
    let [name, ...rest] = cookie.split("=");
    name = name?.trim();
    if (!name) return;
    const value = rest.join("=").trim();
    list[name] = decodeURIComponent(value);
  });

  return list;
}

export function getOrCreateSession(req, res, isProduction = false) {
  const cookies = parseCookies(req.headers.cookie);
  let sessionId = cookies[COOKIE_NAME];

  // Validate format (hex string 32 bytes = 64 chars)
  if (!sessionId || !/^[a-f0-9]{64}$/i.test(sessionId)) {
    sessionId = crypto.randomBytes(32).toString("hex");

    const cookieParts = [
      `${COOKIE_NAME}=${sessionId}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${SESSION_MAX_AGE_SEC}`,
    ];

    if (isProduction) {
      cookieParts.push("Secure");
    }

    res.setHeader("Set-Cookie", cookieParts.join("; "));
  }

  return sessionId;
}
