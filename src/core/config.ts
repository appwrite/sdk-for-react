import type {
  AppwriteHandlerConfig,
  AppwriteSsrConfig,
  ResolvedHandlerConfig,
  ResolvedSsrConfig,
} from "./types";

export const DEFAULT_COOKIE_NAME_PREFIX = "appwrite-session";
export const OAUTH_STATE_COOKIE_NAME = "appwrite-oauth-state";
export const OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;
export const DEFAULT_BASE_PATH = "/api/appwrite";

export function resolveHandlerConfig(config: AppwriteHandlerConfig): ResolvedHandlerConfig {
  if (!config.apiKey) throw new Error("[appwrite-react] config.apiKey is required for handlers");
  return { ...resolveConfig(config), apiKey: config.apiKey };
}

export function resolveConfig(config: AppwriteSsrConfig): ResolvedSsrConfig {
  if (!config.endpoint) throw new Error("[appwrite-react] config.endpoint is required");
  if (!config.projectId) throw new Error("[appwrite-react] config.projectId is required");

  const basePath = (config.basePath ?? DEFAULT_BASE_PATH).replace(/\/+$/, "");

  return {
    endpoint: config.endpoint,
    projectId: config.projectId,
    cookieName: config.cookieName ?? getDefaultCookieName(config.projectId),
    cookieOptions: {
      path: config.cookieOptions?.path ?? "/",
      secure: config.cookieOptions?.secure ?? true,
      sameSite: config.cookieOptions?.sameSite ?? "lax",
      httpOnly: config.cookieOptions?.httpOnly ?? true,
      domain: config.cookieOptions?.domain,
      maxAge: config.cookieOptions?.maxAge,
      expires: config.cookieOptions?.expires,
    },
    basePath,
    redirects: {
      success: config.redirects?.success ?? "/",
      failure: config.redirects?.failure ?? "/",
    },
  };
}

export function getDefaultCookieName(projectId: string): string {
  return `${DEFAULT_COOKIE_NAME_PREFIX}-${projectId}`;
}

export function resolveCookieName(opts: { cookieName?: string; projectId?: string }): string {
  if (opts.cookieName) return opts.cookieName;
  if (opts.projectId) return getDefaultCookieName(opts.projectId);
  throw new Error("[appwrite-react] readSessionCookie requires cookieName or projectId");
}
