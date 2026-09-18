import type { HttpMethod, RequestContext, RouteHandler } from "./types.js";

interface Route {
  method: HttpMethod;
  /** Path template, e.g. "/divisions/:id" */
  segments: string[];
  handler: RouteHandler;
  label: string;
}

/**
 * Tiny hand-rolled router — intentionally not a third-party framework.
 * Supports static segments + ":param" segments. Good enough for a
 * skeleton API; swap for something heavier only if real requirements
 * (wildcards, regex constraints, etc.) actually need it.
 */
export class Router {
  private routes: Route[] = [];

  register(method: HttpMethod, path: string, handler: RouteHandler, label = path): void {
    this.routes.push({ method, segments: splitPath(path), handler, label });
  }

  get(path: string, handler: RouteHandler, label?: string): void {
    this.register("GET", path, handler, label);
  }
  post(path: string, handler: RouteHandler, label?: string): void {
    this.register("POST", path, handler, label);
  }
  patch(path: string, handler: RouteHandler, label?: string): void {
    this.register("PATCH", path, handler, label);
  }
  delete(path: string, handler: RouteHandler, label?: string): void {
    this.register("DELETE", path, handler, label);
  }

  /** Finds a matching route and returns its handler + extracted params. */
  match(method: string, pathname: string): { handler: RouteHandler; params: Record<string, string>; label: string } | null {
    const requestSegments = splitPath(pathname);

    for (const route of this.routes) {
      if (route.method !== method) continue;
      if (route.segments.length !== requestSegments.length) continue;

      const params: Record<string, string> = {};
      let matched = true;

      for (let i = 0; i < route.segments.length; i++) {
        const routeSeg = route.segments[i]!;
        const reqSeg = requestSegments[i]!;

        if (routeSeg.startsWith(":")) {
          params[routeSeg.slice(1)] = decodeURIComponent(reqSeg);
        } else if (routeSeg !== reqSeg) {
          matched = false;
          break;
        }
      }

      if (matched) {
        return { handler: route.handler, params, label: route.label };
      }
    }

    return null;
  }

  /** True if any route matches the path regardless of method (for 405 vs 404). */
  hasPath(pathname: string): boolean {
    const requestSegments = splitPath(pathname);
    return this.routes.some((route) => {
      if (route.segments.length !== requestSegments.length) return false;
      return route.segments.every((seg, i) => seg.startsWith(":") || seg === requestSegments[i]);
    });
  }
}

function splitPath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

export type { RequestContext };
