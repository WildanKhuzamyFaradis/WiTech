import type { IncomingMessage, ServerResponse } from "node:http";
import { Router } from "./core/router.js";
import { sendError, readJsonBody } from "./core/http.js";
import { cors } from "./middleware/cors.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { registerRoutes } from "./routes/index.js";
import type { RequestContext } from "./core/types.js";

const router = new Router();
registerRoutes(router);

const BODY_METHODS = new Set(["POST", "PATCH", "PUT"]);

export async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const ctx: RequestContext = {
    req,
    res,
    params: {},
    query: new URLSearchParams(),
    body: undefined,
  };

  // CORS (also short-circuits OPTIONS preflight requests)
  let corsHandled = false;
  await cors(ctx, () => {
    corsHandled = true;
  });
  if (!corsHandled) return;

  await requestLogger(ctx, async () => {
    await dispatch(ctx);
  });
}

async function dispatch(ctx: RequestContext): Promise<void> {
  const { req, res } = ctx;
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  ctx.query = url.searchParams;

  const method = req.method ?? "GET";
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/v1")) {
    sendError(res, 404, "NOT_FOUND", "Unknown route. All endpoints are under /api/v1.");
    return;
  }

  const apiPath = pathname.slice("/api/v1".length) || "/";

  try {
    if (BODY_METHODS.has(method)) {
      ctx.body = await readJsonBody(req);
    }
  } catch {
    sendError(res, 400, "BAD_REQUEST", "Invalid or oversized JSON body.");
    return;
  }

  const match = router.match(method, apiPath);
  if (!match) {
    const status = router.hasPath(apiPath) ? 405 : 404;
    const code = status === 405 ? "BAD_REQUEST" : "NOT_FOUND";
    const message = status === 405 ? `Method ${method} not allowed on ${apiPath}.` : `No route for ${method} ${apiPath}.`;
    sendError(res, status, code, message);
    return;
  }

  ctx.params = match.params;

  try {
    await match.handler(ctx);
  } catch (err) {
    console.error(`Unhandled error in route "${match.label}":`, err);
    if (!res.headersSent) {
      sendError(res, 500, "INTERNAL_ERROR", "Unexpected server error.");
    }
  }
}
