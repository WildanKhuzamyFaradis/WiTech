import type { Middleware } from "../core/types.js";
import { env } from "../config/env.js";

export const cors: Middleware = (ctx, next) => {
  ctx.res.setHeader("Access-Control-Allow-Origin", env.corsOrigin);
  ctx.res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  ctx.res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (ctx.req.method === "OPTIONS") {
    ctx.res.writeHead(204);
    ctx.res.end();
    return;
  }

  return next();
};
