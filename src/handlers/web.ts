import "server-only";
import { createAppwriteHandlers, defineAdapter } from "./index";
import { readRequestJson } from "../core/body";
import { parseCookieHeader, serializeClearCookie, serializeCookie } from "../core/cookie";
import type { AppwriteHandlerConfig } from "../core/types";

export const webAdapter = defineAdapter<[Request], Response>({
  async toContext(request) {
    const cookies = parseCookieHeader(request.headers.get("cookie"));
    return {
      url: new URL(request.url),
      method: request.method,
      getCookie: (name) => cookies.get(name),
      readJson: () => readRequestJson(request),
    };
  },
  respond(init) {
    const headers = new Headers();
    for (const c of init.setCookies) {
      headers.append("set-cookie", serializeCookie(c.name, c.value, c.options));
    }
    for (const c of init.clearCookies) {
      headers.append("set-cookie", serializeClearCookie(c.name, c.options));
    }

    if (init.redirect) {
      headers.set("location", init.redirect);
      return new Response(null, { status: init.status, headers });
    }

    if (init.body?.type === "json") {
      headers.set("content-type", "application/json; charset=utf-8");
      return new Response(JSON.stringify(init.body.value), { status: init.status, headers });
    }
    if (init.body?.type === "text") {
      headers.set("content-type", "text/plain; charset=utf-8");
      return new Response(init.body.value, { status: init.status, headers });
    }
    return new Response(null, { status: init.status, headers });
  },
});

export function createWebAppwriteHandlers(config: AppwriteHandlerConfig) {
  const handler = createAppwriteHandlers(config, webAdapter);
  return {
    GET: handler,
    POST: handler,
    fetch: handler,
  };
}
