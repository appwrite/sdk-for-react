import type { Models } from "appwrite";

export type SameSite = "strict" | "lax" | "none";

export interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  secure?: boolean;
  sameSite?: SameSite;
  httpOnly?: boolean;
}

export interface AppwriteSsrConfig {
  endpoint: string;
  projectId: string;
  cookieName?: string;
  cookieOptions?: CookieOptions;
  basePath?: string;
  redirects?: {
    success?: string;
    failure?: string;
    signOut?: string;
  };
}

/**
 * Handler-specific config. Requires an Appwrite API key because Appwrite only
 * returns `session.secret` (the value we put in the cookie) when a session is
 * created from a server context authenticated with an API key. Without it,
 * `secret` is empty in the response body — the session does exist on Appwrite
 * but its secret is delivered via the `X-Fallback-Cookies` response header,
 * not a structured field, so we'd be parsing an opaque cookie format. Using
 * an API key is the documented Appwrite SSR pattern.
 *
 * The API key must be a server-side env var. It is never sent to the client.
 */
export interface AppwriteHandlerConfig extends AppwriteSsrConfig {
  apiKey: string;
}

export interface ResolvedSsrConfig {
  endpoint: string;
  projectId: string;
  cookieName: string;
  cookieOptions: Required<Pick<CookieOptions, "path" | "secure" | "sameSite" | "httpOnly">> &
    CookieOptions;
  basePath: string;
  redirects: {
    success: string;
    failure: string;
    signOut: string;
  };
}

export interface ResolvedHandlerConfig extends ResolvedSsrConfig {
  apiKey: string;
}

export interface AdapterRequestContext {
  url: URL;
  method: string;
  getCookie(name: string): string | undefined;
  readJson(): Promise<unknown>;
}

export interface AdapterResponseInit {
  status: number;
  redirect?: string;
  body?: { type: "json"; value: unknown } | { type: "text"; value: string };
  setCookies: Array<{ name: string; value: string; options: CookieOptions }>;
  clearCookies: Array<{ name: string; options: CookieOptions }>;
}

export interface Adapter<TIn extends unknown[], TOut> {
  toContext(...input: TIn): AdapterRequestContext | Promise<AdapterRequestContext>;
  respond(init: AdapterResponseInit, ...input: TIn): TOut | Promise<TOut>;
}

export type HandlerLogic = (ctx: AdapterRequestContext) => Promise<AdapterResponseInit>;

export interface SessionServer {
  account: import("appwrite").Account;
  client: import("appwrite").Client;
}

export interface NodeSessionServer {
  account: import("node-appwrite").Account;
  client: import("node-appwrite").Client;
}

export interface AdminServer {
  account: import("node-appwrite").Account;
  client: import("node-appwrite").Client;
}

export interface ServerHelpers {
  getSession(): Promise<Models.Session | null>;
  getLoggedInUser(): Promise<Models.User<Models.Preferences> | null>;
  createSessionClient(): Promise<SessionServer | null>;
}
