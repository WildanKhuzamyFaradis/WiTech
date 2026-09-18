import type { Router } from "../core/router.js";
import { registerPublicRoutes } from "./public.routes.js";
import { registerAdminRoutes } from "./admin.routes.js";

export function registerRoutes(router: Router): void {
  registerPublicRoutes(router);
  registerAdminRoutes(router);

  // Simple liveness check, not part of API_SPEC.md but useful for deploy/monitoring
  router.get("/health", (ctx) => {
    ctx.res.writeHead(200, { "Content-Type": "application/json" });
    ctx.res.end(JSON.stringify({ success: true, data: { status: "ok" } }));
  });
}
