import type { IncomingMessage, ServerResponse } from "node:http";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/**
 * Per-request context passed through the router and middleware chain.
 * Extend this as real auth/session handling gets implemented.
 */
export interface RequestContext {
  req: IncomingMessage;
  res: ServerResponse;
  /** Path params extracted from the matched route, e.g. { id: "abc" } */
  params: Record<string, string>;
  /** Parsed query string params */
  query: URLSearchParams;
  /** Parsed JSON body, if any (set by the body-parser middleware) */
  body: unknown;
  /** Set by the auth middleware once bearer-token verification is implemented */
  auth?: { token: string };
}

export type NextFn = () => Promise<void> | void;
export type Middleware = (ctx: RequestContext, next: NextFn) => Promise<void> | void;
export type RouteHandler = (ctx: RequestContext) => Promise<void> | void;
