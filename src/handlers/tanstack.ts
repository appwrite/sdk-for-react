import "@tanstack/react-start/server-only";
import { resolveHandlerConfig } from "../core/config";
import { createHandlerLogic } from "../core/handler";
import { parseCookieHeader, serializeClearCookie, serializeCookie } from "../core/cookie";
import type { AdapterResponseInit, AppwriteHandlerConfig } from "../core/types";

export type { AppwriteHandlerConfig, AppwriteSsrConfig, CookieOptions, SameSite } from "../core/types";

export interface TanStackStartHandlerContext {
  request: Request;
}

function createResponse(init: AdapterResponseInit) {
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
}

export function createAppwriteHandlers(config: AppwriteHandlerConfig) {
  const resolved = resolveHandlerConfig(config);
  const logic = createHandlerLogic(resolved);

  const handler = async ({ request }: TanStackStartHandlerContext) => {
    const cookies = parseCookieHeader(request.headers.get("cookie"));
    const init = await logic({
      url: new URL(request.url),
      method: request.method,
      getCookie: (name) => cookies.get(name),
      readJson: async () => {
        const text = await request.text();
        if (!text) return null;
        return JSON.parse(text);
      },
    });
    return createResponse(init);
  };

  return {
    GET: handler,
    POST: handler,
  };
}
