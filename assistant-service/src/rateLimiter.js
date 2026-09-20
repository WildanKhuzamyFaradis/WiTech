/**
 * Lightweight in-memory rate limiter and session concurrency guard.
 *
 * Requirements:
 * 1. Two dimensions:
 *    - Per anonymous session (~5 requests / 10 min)
 *    - Per IP address (~10 requests / 10 min)
 * 2. Global burst protection (~5 requests / 2 seconds)
 * 3. Single active AI request per session (concurrency guard).
 *
 * Note: If the service is scaled to multiple instances, this in-memory
 * state will need to be backed by a shared store (e.g. Redis/Upstash).
 */

const SESSION_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_MAX_REQUESTS = 5;

const IP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const IP_MAX_REQUESTS = 10;

const BURST_WINDOW_MS = 2000; // 2 seconds
const BURST_MAX_REQUESTS = 5;

// Maps: key -> array of timestamps
const sessionHistory = new Map();
const ipHistory = new Map();
const globalHistory = [];

// Concurrency set: active sessionId
const activeSessions = new Set();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();

  for (const [sid, timestamps] of sessionHistory.entries()) {
    const valid = timestamps.filter((t) => now - t < SESSION_WINDOW_MS);
    if (valid.length === 0) sessionHistory.delete(sid);
    else sessionHistory.set(sid, valid);
  }

  for (const [ip, timestamps] of ipHistory.entries()) {
    const valid = timestamps.filter((t) => now - t < IP_WINDOW_MS);
    if (valid.length === 0) ipHistory.delete(ip);
    else ipHistory.set(ip, valid);
  }
}, 60 * 1000).unref();

export function checkRateLimits({ sessionId, ip }) {
  const now = Date.now();

  // 1. Global Burst Protection
  while (globalHistory.length > 0 && now - globalHistory[0] > BURST_WINDOW_MS) {
    globalHistory.shift();
  }
  if (globalHistory.length >= BURST_MAX_REQUESTS) {
    const retryAfter = Math.ceil((BURST_WINDOW_MS - (now - globalHistory[0])) / 1000) || 1;
    return { limited: true, reason: "rate_limited", retryAfter };
  }

  // 2. Per-Session Rate Limit
  if (sessionId) {
    const sList = (sessionHistory.get(sessionId) || []).filter((t) => now - t < SESSION_WINDOW_MS);
    sessionHistory.set(sessionId, sList);
    if (sList.length >= SESSION_MAX_REQUESTS) {
      const oldest = sList[0];
      const retryAfter = Math.ceil((SESSION_WINDOW_MS - (now - oldest)) / 1000) || 60;
      return { limited: true, reason: "rate_limited", retryAfter };
    }
  }

  // 3. Per-IP Rate Limit
  if (ip) {
    const ipList = (ipHistory.get(ip) || []).filter((t) => now - t < IP_WINDOW_MS);
    ipHistory.set(ip, ipList);
    if (ipList.length >= IP_MAX_REQUESTS) {
      const oldest = ipList[0];
      const retryAfter = Math.ceil((IP_WINDOW_MS - (now - oldest)) / 1000) || 60;
      return { limited: true, reason: "rate_limited", retryAfter };
    }
  }

  return { limited: false };
}

export function recordRequest({ sessionId, ip }) {
  const now = Date.now();
  globalHistory.push(now);

  if (sessionId) {
    const sList = sessionHistory.get(sessionId) || [];
    sList.push(now);
    sessionHistory.set(sessionId, sList);
  }

  if (ip) {
    const ipList = ipHistory.get(ip) || [];
    ipList.push(now);
    ipHistory.set(ip, ipList);
  }
}

/**
 * Concurrency Guard: Ensure only 1 active request per session at any time.
 */
export function acquireSessionLock(sessionId) {
  if (!sessionId) return true;
  if (activeSessions.has(sessionId)) {
    return false;
  }
  activeSessions.add(sessionId);
  return true;
}

export function releaseSessionLock(sessionId) {
  if (!sessionId) return;
  activeSessions.delete(sessionId);
}
