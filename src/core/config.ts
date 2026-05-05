import type {
  AppwriteHandlerConfig,
  AppwriteSsrConfig,
  ResolvedHandlerConfig,
  ResolvedSsrConfig,
} from "./types";

export const DEFAULT_COOKIE_NAME = "appwrite-session";
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
    cookieName: config.cookieName ?? DEFAULT_COOKIE_NAME,
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
      signOut: config.redirects?.signOut ?? config.redirects?.success ?? "/",
    },
  };
}
