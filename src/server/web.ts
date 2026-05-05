import "server-only";
import { parseCookieHeader } from "../core/cookie";
import { createServerHelpers } from "./index";
import type { AppwriteSsrConfig, ServerHelpers } from "../core/types";

export function createWebServerHelpers(
  config: AppwriteSsrConfig,
): (request: Request) => ServerHelpers {
  const cookieName = config.cookieName ?? "appwrite-session";

  return (request: Request) => {
    const cookies = parseCookieHeader(request.headers.get("cookie"));
    return createServerHelpers(config, () => cookies.get(cookieName));
  };
}
