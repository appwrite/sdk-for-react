import "server-only";
import type { IncomingMessage } from "node:http";
import { DEFAULT_COOKIE_NAME } from "../core/config";
import { parseCookieHeader } from "../core/cookie";
import { createServerHelpers } from "./index";
import type { AppwriteSsrConfig, ServerHelpers } from "../core/types";

export function createNodeServerHelpers(
  config: AppwriteSsrConfig,
): (req: IncomingMessage) => ServerHelpers {
  const cookieName = config.cookieName ?? DEFAULT_COOKIE_NAME;

  return (req: IncomingMessage) => {
    const cookies = parseCookieHeader(req.headers.cookie);
    return createServerHelpers(config, () => cookies.get(cookieName));
  };
}
