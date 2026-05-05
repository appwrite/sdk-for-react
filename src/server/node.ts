import "server-only";
import type { IncomingMessage } from "node:http";
import { parseCookieHeader } from "../core/cookie";
import { createServerHelpers } from "./index";
import type { AppwriteSsrConfig, ServerHelpers } from "../core/types";

export function createNodeServerHelpers(
  config: AppwriteSsrConfig,
): (req: IncomingMessage) => ServerHelpers {
  const cookieName = config.cookieName ?? "appwrite-session";

  return (req: IncomingMessage) => {
    const cookies = parseCookieHeader(req.headers.cookie);
    return createServerHelpers(config, () => cookies.get(cookieName));
  };
}
