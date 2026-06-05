import "server-only";
import { cookies } from "next/headers";
import { resolveConfig, resolveCookieName } from "../core/config";
import { createServerHelpersFromCookieReader } from "../core/server";
import type {
  AdminServerHelpers,
  AppwriteAdminServerConfig,
  AppwriteServerConfig,
  AppwriteServerConfigWithoutApiKey,
  ServerHelpers,
} from "../core/types";

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
  config: AppwriteAdminServerConfig,
): AdminServerHelpers & { readSessionCookie(): Promise<string | undefined> };

export function createNextServerHelpers(
  config: AppwriteServerConfigWithoutApiKey,
): ServerHelpers & { readSessionCookie(): Promise<string | undefined> };

export function createNextServerHelpers(
  config: AppwriteServerConfig,
): (AdminServerHelpers | ServerHelpers) & { readSessionCookie(): Promise<string | undefined> };

export function createNextServerHelpers(
  config: AppwriteServerConfig,
): (AdminServerHelpers | ServerHelpers) & { readSessionCookie(): Promise<string | undefined> } {
  const resolved = resolveConfig(config);
  const cookieName = resolved.cookieName;
  const read = () => readSessionCookie({ cookieName });
  const helpers = createServerHelpersFromCookieReader(
    { ...resolved, apiKey: config.apiKey },
    read,
  );
  return { ...helpers, readSessionCookie: read };
}
