import "server-only";
import { Account as NodeAccount, Client as NodeClient } from "node-appwrite";
import { resolveConfig } from "../core/config";
import { buildAnonymousClient } from "../core/client";
import { buildNodeSessionClient } from "../core/node-client";
import { createServerHelpersFromCookieReader } from "../core/server";
import type {
  AdminServer,
  AppwriteSsrConfig,
  NodeSessionServer,
  ServerHelpers,
  SessionServer,
} from "../core/types";

export type {
  AdminServer,
  AppwriteHandlerConfig,
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
  const client = new NodeClient()
    .setEndpoint(resolved.endpoint)
    .setProject(resolved.projectId)
    .setKey(config.apiKey);
  return { client, account: new NodeAccount(client) };
}

export function createServerHelpers(
  config: AppwriteSsrConfig,
  readCookie: () => string | undefined | Promise<string | undefined>,
): ServerHelpers {
  return createServerHelpersFromCookieReader(resolveConfig(config), readCookie);
}
