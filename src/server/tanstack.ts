import "@tanstack/react-start/server-only";
import { getRequestHeader } from "@tanstack/react-start/server";
import { Account as NodeAccount, Client as NodeClient } from "node-appwrite";
import { buildAnonymousClient, buildSessionClient } from "../core/client";
import { getDefaultCookieName, resolveConfig } from "../core/config";
import { parseCookieHeader } from "../core/cookie";
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

export function readSessionCookie(opts: {
  cookieName?: string;
  projectId?: string;
}): string | undefined {
  const cookies = parseCookieHeader(getRequestHeader("cookie"));
  return cookies.get(resolveCookieName(opts));
}

export function createSessionClient(
  config: AppwriteSsrConfig,
  session: string,
): SessionServer {
  return buildSessionClient(resolveConfig(config), session);
}

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

export function createAdminClient(config: AdminClientConfig): AdminServer {
  const resolved = resolveConfig(config);
  const client = new NodeClient()
    .setEndpoint(resolved.endpoint)
    .setProject(resolved.projectId)
    .setKey(config.apiKey);
  return { client, account: new NodeAccount(client) };
}

export function createTanStackServerHelpers(
  config: AppwriteSsrConfig,
): ServerHelpers & { readSessionCookie(): string | undefined } {
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
