import "server-only";
import { cookies } from "next/headers";
import { createServerHelpers } from "./index";
import { DEFAULT_COOKIE_NAME } from "../core/config";
import type { AppwriteSsrConfig, ServerHelpers } from "../core/types";

/**
 * Read the session secret from the request cookie. Standalone — no config
 * factory needed. Uses the default cookie name unless overridden.
 */
export async function readSessionCookie(opts?: {
  cookieName?: string;
}): Promise<string | undefined> {
  const store = await cookies();
  return store.get(opts?.cookieName ?? DEFAULT_COOKIE_NAME)?.value;
}

export function createNextServerHelpers(
  config: AppwriteSsrConfig,
): ServerHelpers & { readSessionCookie(): Promise<string | undefined> } {
  const cookieName = config.cookieName ?? DEFAULT_COOKIE_NAME;
  const read = () => readSessionCookie({ cookieName });
  const helpers = createServerHelpers(config, read);
  return { ...helpers, readSessionCookie: read };
}
