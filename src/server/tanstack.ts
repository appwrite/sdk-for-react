import "@tanstack/react-start/server-only";
import { getRequestHeader } from "@tanstack/react-start/server";
import { buildAnonymousClient } from "../core/client";
import { resolveConfig, resolveCookieName } from "../core/config";
import { parseCookieHeader } from "../core/cookie";
import { buildAdminClient, buildNodeSessionClient } from "../core/node-client";
import { createServerHelpersFromCookieReader } from "../core/server";
import type {
  AdminServer,
  AppwriteServerConfig,
  AppwriteSsrConfig,
  NodeSessionServer,
  ServerHelpers,
  SessionServer,
} from "../core/types";

export type {
  AdminServer,
  AppwriteHandlerConfig,
  AppwriteServerConfig,
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
): NodeSessionServer {
  return buildNodeSessionClient(resolveConfig(config), session);
}

export function createAnonymousClient(config: AppwriteSsrConfig): SessionServer {
  return buildAnonymousClient(resolveConfig(config));
}

export interface AdminClientConfig extends AppwriteSsrConfig {
  apiKey: string;
}

export function createAdminClient(config: AdminClientConfig): AdminServer {
  const resolved = resolveConfig(config);
  return buildAdminClient(resolved, config.apiKey);
}

export function createTanStackServerHelpers(
  config: AppwriteServerConfig,
): ServerHelpers & { readSessionCookie(): string | undefined } {
  const resolved = resolveConfig(config);
  const cookieName = resolved.cookieName;
  const read = () => readSessionCookie({ cookieName });
  const helpers = createServerHelpersFromCookieReader(
    { ...resolved, apiKey: config.apiKey },
    read,
  );
  return { ...helpers, readSessionCookie: read };
}
