import type { ServerResponse, IncomingMessage } from "node:http";

/** Error codes as listed in API_SPEC.md → Error Handling */
export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "NOT_IMPLEMENTED"
  | "INTERNAL_ERROR";

interface Meta {
  page?: number;
  limit?: number;
  total?: number;
}

/** Success envelope: { success: true, data, meta? } — per API_SPEC.md */
export function sendSuccess(res: ServerResponse, status: number, data: unknown, meta?: Meta): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ success: true, data, ...(meta ? { meta } : {}) }));
}

/** Error envelope: { success: false, error: { code, message, details? } } — per API_SPEC.md */
export function sendError(
  res: ServerResponse,
  status: number,
  code: ErrorCode,
  message: string,
  details?: unknown,
): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ success: false, error: { code, message, ...(details ? { details } : {}) } }));
}

/**
 * Placeholder response for every route below — this skeleton wires up
 * routing + envelope shape only. Swap this out per-route once the real
 * handler (data access, validation, etc.) is implemented.
 */
export function sendNotImplemented(res: ServerResponse, routeLabel: string): void {
  sendError(res, 501, "NOT_IMPLEMENTED", `${routeLabel} is not implemented yet.`);
}

/** Reads and JSON-parses the request body (used for POST/PATCH/PUT). */
export function readJsonBody(req: IncomingMessage, maxBytes = 1_000_000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      if (chunks.length === 0) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}
