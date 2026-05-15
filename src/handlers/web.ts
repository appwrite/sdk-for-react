import "server-only";
import { createAppwriteHandlers, defineAdapter } from "./index";
import { createFetchResponse } from "./fetch";
import { readRequestJson } from "../core/body";
import { parseCookieHeader } from "../core/cookie";
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
    return createFetchResponse(init);
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
