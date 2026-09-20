/**
 * Circuit breaker for Copilot runtime calls.
 *
 * Prevents hammering upstream Copilot when:
 * 1. Rate limited (429 / rate_limited) -> short cooldown (~30 seconds)
 * 2. Quota exhausted (RESOURCE_EXHAUSTED / quota_exhausted) -> longer cooldown (~5 minutes)
 *
 * When circuit is open:
 * Returns { allowed: false, reason: "quota_exhausted" | "rate_limited" | "ai_unavailable" }
 * without making any call to Copilot.
 */

export const RATE_LIMIT_COOLDOWN_MS = 30 * 1000;      // 30 seconds
export const QUOTA_EXHAUSTED_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

class CircuitBreaker {
  constructor() {
    this.state = "CLOSED"; // "CLOSED" | "OPEN"
    this.openUntil = 0;
    this.lastReason = null;
  }

  isOpen() {
    if (this.state === "OPEN") {
      if (Date.now() < this.openUntil) {
        return true;
      }
      // Cooldown expired, transition to HALF_OPEN / CLOSED
      this.state = "CLOSED";
      this.lastReason = null;
      return false;
    }
    return false;
  }

  trip(reason) {
    this.state = "OPEN";
    this.lastReason = reason;

    if (reason === "quota_exhausted") {
      this.openUntil = Date.now() + QUOTA_EXHAUSTED_COOLDOWN_MS;
      console.warn(`[CircuitBreaker] Tripped for quota_exhausted. Open for ${QUOTA_EXHAUSTED_COOLDOWN_MS / 1000}s`);
    } else if (reason === "rate_limited") {
      this.openUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
      console.warn(`[CircuitBreaker] Tripped for rate_limited. Open for ${RATE_LIMIT_COOLDOWN_MS / 1000}s`);
    } else {
      this.openUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
      console.warn(`[CircuitBreaker] Tripped for ${reason}. Open for ${RATE_LIMIT_COOLDOWN_MS / 1000}s`);
    }
  }

  reset() {
    this.state = "CLOSED";
    this.openUntil = 0;
    this.lastReason = null;
  }

  getStatus() {
    return {
      state: this.state,
      isOpen: this.isOpen(),
      remainingMs: Math.max(0, this.openUntil - Date.now()),
      reason: this.lastReason,
    };
  }
}

export const copilotCircuitBreaker = new CircuitBreaker();
