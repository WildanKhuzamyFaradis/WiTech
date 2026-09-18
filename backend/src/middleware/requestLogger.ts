import type { Middleware } from "../core/types.js";

export const requestLogger: Middleware = async (ctx, next) => {
  const start = Date.now();
  const { method, url } = ctx.req;

  await next();

  const ms = Date.now() - start;
  console.log(`${method} ${url} — ${ctx.res.statusCode} (${ms}ms)`);
};
