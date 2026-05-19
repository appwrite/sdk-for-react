import "server-only";
import { resolveConfig } from "../core/config";
import { parseCookieHeader } from "../core/cookie";
import { createServerHelpersFromCookieReader } from "../core/server";
import type { AppwriteSsrConfig, ServerHelpers } from "../core/types";

export function createWebServerHelpers(
  config: AppwriteSsrConfig,
): (request: Request) => ServerHelpers & { readSessionCookie(): string | undefined } {
  const resolved = resolveConfig(config);
  const cookieName = resolved.cookieName;

  return (request: Request) => {
    const cookies = parseCookieHeader(request.headers.get("cookie"));
    const read = () => cookies.get(cookieName);
    const helpers = createServerHelpersFromCookieReader(resolved, read);
    return { ...helpers, readSessionCookie: read };
  };
}
