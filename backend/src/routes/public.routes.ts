import type { Router } from "../core/router.js";
import { sendNotImplemented } from "../core/http.js";

/**
 * Public endpoints — see API_SPEC.md § "Endpoint Publik".
 * All handlers are placeholders (501 Not Implemented). Fill each one in
 * with real data access once a data source is decided.
 */
export function registerPublicRoutes(router: Router): void {
  // 1. Divisions
  router.get("/divisions", (ctx) => sendNotImplemented(ctx.res, "GET /divisions"));
  router.get("/divisions/:id", (ctx) => sendNotImplemented(ctx.res, "GET /divisions/:id"));

  // 2. Members
  router.get("/members", (ctx) => sendNotImplemented(ctx.res, "GET /members"));
  router.get("/members/:id", (ctx) => sendNotImplemented(ctx.res, "GET /members/:id"));

  // 3. Projects
  router.get("/projects", (ctx) => sendNotImplemented(ctx.res, "GET /projects"));
  router.get("/projects/:slug", (ctx) => sendNotImplemented(ctx.res, "GET /projects/:slug"));

  // 4. Albums & Gallery
  router.get("/albums", (ctx) => sendNotImplemented(ctx.res, "GET /albums"));
  router.get("/albums/:slug", (ctx) => sendNotImplemented(ctx.res, "GET /albums/:slug"));

  // 5. Events
  router.get("/events", (ctx) => sendNotImplemented(ctx.res, "GET /events"));
  router.get("/events/:id", (ctx) => sendNotImplemented(ctx.res, "GET /events/:id"));

  // 6. FAQ
  router.get("/faqs", (ctx) => sendNotImplemented(ctx.res, "GET /faqs"));

  // 7. Contact
  router.post("/contact", (ctx) => sendNotImplemented(ctx.res, "POST /contact"));
}
