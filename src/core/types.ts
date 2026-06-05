import type { Models } from "node-appwrite";

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
  };
}

export interface AppwriteServerConfig extends AppwriteSsrConfig {
  apiKey?: string;
}

export interface AppwriteServerConfigWithoutApiKey extends AppwriteSsrConfig {
  apiKey?: undefined;
}

export interface AppwriteAdminServerConfig extends AppwriteSsrConfig {
  apiKey: string;
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
  };
}

export interface ResolvedServerConfig extends ResolvedSsrConfig {
  apiKey?: string;
}

export interface ResolvedServerConfigWithoutApiKey extends ResolvedSsrConfig {
  apiKey?: undefined;
}

export interface ResolvedAdminServerConfig extends ResolvedSsrConfig {
  apiKey: string;
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
  activities: import("node-appwrite").Activities;
  advisor: import("node-appwrite").Advisor;
  avatars: import("node-appwrite").Avatars;
  backups: import("node-appwrite").Backups;
  client: import("node-appwrite").Client;
  databases: import("node-appwrite").Databases;
  functions: import("node-appwrite").Functions;
  graphql: import("node-appwrite").Graphql;
  health: import("node-appwrite").Health;
  locale: import("node-appwrite").Locale;
  messaging: import("node-appwrite").Messaging;
  organization: import("node-appwrite").Organization;
  presences: import("node-appwrite").Presences;
  project: import("node-appwrite").Project;
  proxy: import("node-appwrite").Proxy;
  sites: import("node-appwrite").Sites;
  storage: import("node-appwrite").Storage;
  tablesDB: import("node-appwrite").TablesDB;
  teams: import("node-appwrite").Teams;
  tokens: import("node-appwrite").Tokens;
  usage: import("node-appwrite").Usage;
  users: import("node-appwrite").Users;
  webhooks: import("node-appwrite").Webhooks;
}

export interface ServerHelpers {
  getSession(): Promise<Models.Session | null>;
  getLoggedInUser(): Promise<Models.User<Models.Preferences> | null>;
  createSessionClient(): Promise<NodeSessionServer | null>;
}

export interface AdminServerHelpers extends ServerHelpers {
  createAdminClient(): AdminServer;
}
