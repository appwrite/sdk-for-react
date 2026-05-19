import "server-only";
import type { IncomingMessage } from "node:http";
import { resolveConfig } from "../core/config";
import { parseCookieHeader } from "../core/cookie";
import { createServerHelpersFromCookieReader } from "../core/server";
import type { AppwriteSsrConfig, ServerHelpers } from "../core/types";

export function createNodeServerHelpers(
  config: AppwriteSsrConfig,
): (req: IncomingMessage) => ServerHelpers & { readSessionCookie(): string | undefined } {
  const resolved = resolveConfig(config);
  const cookieName = resolved.cookieName;

  return (req: IncomingMessage) => {
    const cookies = parseCookieHeader(req.headers.cookie);
    const read = () => cookies.get(cookieName);
    const helpers = createServerHelpersFromCookieReader(resolved, read);
    return { ...helpers, readSessionCookie: read };
  };
}
