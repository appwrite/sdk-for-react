import "server-only";
import { Account as NodeAccount, Client as NodeClient } from "node-appwrite";
import { resolveConfig } from "../core/config";
import { buildAnonymousClient, buildSessionClient } from "../core/client";
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
): SessionServer {
  return buildSessionClient(resolveConfig(config), session);
}

/**
 * Returns a `node-appwrite` client authenticated as the user via setSession.
 * Use when you want the server SDK ergonomics (same package as createAdminClient,
 * full server feature surface) for per-request user-scoped operations.
 */
export function createNodeSessionClient(
  config: AppwriteSsrConfig,
  session: string,
): NodeSessionServer {
  const resolved = resolveConfig(config);
  const client = new NodeClient()
    .setEndpoint(resolved.endpoint)
    .setProject(resolved.projectId)
    .setSession(session);
  return { client, account: new NodeAccount(client) };
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
