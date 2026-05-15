import "@tanstack/react-start/server-only";
import { createFetchResponse } from "./fetch";
import { resolveHandlerConfig } from "../core/config";
import { createHandlerLogic } from "../core/handler";
import { readRequestJson } from "../core/body";
import { parseCookieHeader } from "../core/cookie";
import type { AppwriteHandlerConfig } from "../core/types";

export type { AppwriteHandlerConfig, AppwriteSsrConfig, CookieOptions, SameSite } from "../core/types";

export interface TanStackStartHandlerContext {
  request: Request;
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
      readJson: () => readRequestJson(request),
    });
    return createFetchResponse(init);
  };

  return {
    GET: handler,
    POST: handler,
  };
}
