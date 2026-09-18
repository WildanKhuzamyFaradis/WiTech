import type { Router } from "../core/router.js";
import { sendNotImplemented } from "../core/http.js";
import { requireAuth } from "../middleware/auth.js";

/**
 * Admin endpoints — see API_SPEC.md § "Endpoint Admin".
 * Base path (mounted in routes/index.ts): /admin
 * All handlers are placeholders (501 Not Implemented).
 *
 * Every route except login/refresh runs behind requireAuth(), which today
 * only checks that a Bearer token is present — it doesn't verify it yet.
 */
export function registerAdminRoutes(router: Router): void {
  // Auth — login/refresh happen before a token exists, so no guard here.
  router.post("/admin/auth/login", (ctx) => sendNotImplemented(ctx.res, "POST /admin/auth/login"));
  router.post("/admin/auth/refresh", (ctx) => sendNotImplemented(ctx.res, "POST /admin/auth/refresh"));
  router.post("/admin/auth/logout", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "POST /admin/auth/logout");
  });

  // Me
  router.get("/admin/me", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "GET /admin/me");
  });

  // Divisions
  router.get("/admin/divisions", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "GET /admin/divisions");
  });
  router.post("/admin/divisions", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "POST /admin/divisions");
  });
  router.patch("/admin/divisions/:id", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "PATCH /admin/divisions/:id");
  });
  router.delete("/admin/divisions/:id", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "DELETE /admin/divisions/:id");
  });

  // Projects (Portfolio)
  router.get("/admin/projects", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "GET /admin/projects");
  });
  router.post("/admin/projects", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "POST /admin/projects"); // multipart: image — see API_SPEC.md
  });
  router.patch("/admin/projects/:id", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "PATCH /admin/projects/:id");
  });
  router.delete("/admin/projects/:id", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "DELETE /admin/projects/:id");
  });

  // Members
  router.get("/admin/members", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "GET /admin/members");
  });
  router.post("/admin/members", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "POST /admin/members"); // multipart: avatar
  });
  router.patch("/admin/members/:id", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "PATCH /admin/members/:id");
  });
  router.delete("/admin/members/:id", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "DELETE /admin/members/:id"); // soft-deactivate per spec
  });

  // Albums (Gallery)
  router.get("/admin/albums", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "GET /admin/albums");
  });
  router.post("/admin/albums", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "POST /admin/albums"); // multipart: coverImage + photos[]
  });
  router.patch("/admin/albums/:id", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "PATCH /admin/albums/:id");
  });
  router.delete("/admin/albums/:id", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "DELETE /admin/albums/:id");
  });
  router.post("/admin/albums/:id/photos", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "POST /admin/albums/:id/photos");
  });

  // Events
  router.get("/admin/events", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "GET /admin/events");
  });
  router.post("/admin/events", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "POST /admin/events"); // multipart: image
  });
  router.patch("/admin/events/:id", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "PATCH /admin/events/:id");
  });
  router.delete("/admin/events/:id", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "DELETE /admin/events/:id");
  });

  // FAQ
  router.get("/admin/faqs", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "GET /admin/faqs");
  });
  router.post("/admin/faqs", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "POST /admin/faqs");
  });
  router.patch("/admin/faqs/:id", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "PATCH /admin/faqs/:id");
  });
  router.delete("/admin/faqs/:id", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "DELETE /admin/faqs/:id");
  });

  // Messages (from public contact form)
  router.get("/admin/messages", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "GET /admin/messages");
  });
  router.patch("/admin/messages/:id", (ctx) => {
    if (!requireAuth(ctx)) return;
    sendNotImplemented(ctx.res, "PATCH /admin/messages/:id");
  });
}
