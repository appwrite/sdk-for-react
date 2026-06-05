import "server-only";
import { resolveConfig } from "../core/config";
import { parseCookieHeader } from "../core/cookie";
import { createServerHelpersFromCookieReader } from "../core/server";
import type { AppwriteServerConfig, ServerHelpers } from "../core/types";

export function createWebServerHelpers(
  config: AppwriteServerConfig,
): (request: Request) => ServerHelpers & { readSessionCookie(): string | undefined } {
  const resolved = resolveConfig(config);
  const cookieName = resolved.cookieName;

  return (request: Request) => {
    const cookies = parseCookieHeader(request.headers.get("cookie"));
    const read = () => cookies.get(cookieName);
    const helpers = createServerHelpersFromCookieReader(
      { ...resolved, apiKey: config.apiKey },
      read,
    );
    return { ...helpers, readSessionCookie: read };
  };
}
