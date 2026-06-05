import "server-only";
import { resolveConfig } from "../core/config";
import { buildAnonymousClient } from "../core/client";
import { buildAdminClient, buildNodeSessionClient } from "../core/node-client";
import { createServerHelpersFromCookieReader } from "../core/server";
import type {
  AdminServerHelpers,
  AdminServer,
  AppwriteAdminServerConfig,
  AppwriteServerConfig,
  AppwriteServerConfigWithoutApiKey,
  AppwriteSsrConfig,
  NodeSessionServer,
  ServerHelpers,
  SessionServer,
} from "../core/types";

export type {
  AdminServerHelpers,
  AdminServer,
  AppwriteAdminServerConfig,
  AppwriteHandlerConfig,
  AppwriteServerConfig,
  AppwriteServerConfigWithoutApiKey,
  AppwriteSsrConfig,
  CookieOptions,
  NodeSessionServer,
  SameSite,
  ServerHelpers,
  SessionServer,
} from "../core/types";

export function createSessionClient(
  config: AppwriteSsrConfig,
  session: string,
): NodeSessionServer {
  return buildNodeSessionClient(resolveConfig(config), session);
}

export function createAnonymousClient(config: AppwriteSsrConfig): SessionServer {
  return buildAnonymousClient(resolveConfig(config));
}

export interface AdminClientConfig extends AppwriteSsrConfig {
  apiKey: string;
}

/**
 * Returns a `node-appwrite` admin client (project API key auth) for performing
 * administrative operations server-side: managing users, listing sessions,
 * creating teams, etc. Note that this uses the `node-appwrite` SDK types,
 * which are distinct from the `appwrite` (web) SDK types used elsewhere.
 */
export function createAdminClient(config: AdminClientConfig): AdminServer {
  const resolved = resolveConfig(config);
  return buildAdminClient(resolved, config.apiKey);
}

export function createServerHelpers(
  config: AppwriteAdminServerConfig,
  readCookie: () => string | undefined | Promise<string | undefined>,
): AdminServerHelpers;

export function createServerHelpers(
  config: AppwriteServerConfigWithoutApiKey,
  readCookie: () => string | undefined | Promise<string | undefined>,
): ServerHelpers;

export function createServerHelpers(
  config: AppwriteServerConfig,
  readCookie: () => string | undefined | Promise<string | undefined>,
): AdminServerHelpers | ServerHelpers;

export function createServerHelpers(
  config: AppwriteServerConfig,
  readCookie: () => string | undefined | Promise<string | undefined>,
): AdminServerHelpers | ServerHelpers {
  return createServerHelpersFromCookieReader(
    { ...resolveConfig(config), apiKey: config.apiKey },
    readCookie,
  );
}
