import "server-only";
import { DEFAULT_COOKIE_NAME } from "../core/config";
import { parseCookieHeader } from "../core/cookie";
import { createServerHelpers } from "./index";
import type { AppwriteSsrConfig, ServerHelpers } from "../core/types";

export function createWebServerHelpers(
  config: AppwriteSsrConfig,
): (request: Request) => ServerHelpers {
  const cookieName = config.cookieName ?? DEFAULT_COOKIE_NAME;

  return (request: Request) => {
    const cookies = parseCookieHeader(request.headers.get("cookie"));
    return createServerHelpers(config, () => cookies.get(cookieName));
  };
}
