import "server-only";
import { cookies } from "next/headers";
import { getDefaultCookieName, resolveConfig } from "../core/config";
import { createServerHelpersFromCookieReader } from "../core/server";
import type { AppwriteSsrConfig, ServerHelpers } from "../core/types";

/**
 * Read the session secret from the request cookie. Prefer the configured
 * helper returned by createNextServerHelpers() so the project-scoped default
 * cookie name is derived from config.
 */
export async function readSessionCookie(opts: {
  cookieName?: string;
  projectId?: string;
}): Promise<string | undefined> {
  const store = await cookies();
  return store.get(resolveCookieName(opts))?.value;
}

export function createNextServerHelpers(
  config: AppwriteSsrConfig,
): ServerHelpers & { readSessionCookie(): Promise<string | undefined> } {
  const resolved = resolveConfig(config);
  const cookieName = resolved.cookieName;
  const read = () => readSessionCookie({ cookieName });
  const helpers = createServerHelpersFromCookieReader(resolved, read);
  return { ...helpers, readSessionCookie: read };
}

function resolveCookieName(opts: { cookieName?: string; projectId?: string }): string {
  if (opts.cookieName) return opts.cookieName;
  if (opts.projectId) return getDefaultCookieName(opts.projectId);
  throw new Error("[appwrite-react] readSessionCookie requires cookieName or projectId");
}
