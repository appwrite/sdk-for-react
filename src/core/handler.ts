import { AppwriteException, ID } from "appwrite";
import { Account as NodeAccount, Client as NodeClient } from "node-appwrite";
import { buildSessionClient } from "./client";

/**
 * Strip non-plain shapes from web-SDK responses so handler payloads cross the
 * wire / RSC boundary cleanly. See core/server.ts:toPlain for the full why.
 */
function toPlain<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
  );
}
import type {
  AdapterRequestContext,
  AdapterResponseInit,
  HandlerLogic,
  ResolvedHandlerConfig,
} from "./types";

type Route = {
  method: "GET" | "POST";
  path: string;
  handle: HandlerLogic;
};

export function createHandlerLogic(config: ResolvedHandlerConfig): HandlerLogic {
  const routes: Route[] = [
    { method: "GET", path: "/oauth/callback", handle: oauthCallback(config) },
    { method: "GET", path: "/oauth/failure", handle: oauthFailure(config) },
    { method: "POST", path: "/sign-in/email-password", handle: signInEmailPassword(config) },
    { method: "POST", path: "/sign-up/email-password", handle: signUpEmailPassword(config) },
    { method: "POST", path: "/sign-out", handle: signOut(config) },
  ];

  return async (ctx) => {
    const subPath = stripBasePath(ctx.url.pathname, config.basePath);
    if (subPath === null) return notFound();

    const route = routes.find((r) => r.method === ctx.method && r.path === subPath);
    if (!route) return notFound();

    try {
      return await route.handle(ctx);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

function buildAdminAccount(config: ResolvedHandlerConfig): NodeAccount {
  const client = new NodeClient()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);
  return new NodeAccount(client);
}

function stripBasePath(pathname: string, basePath: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const base = basePath.replace(/\/+$/, "");
  if (normalized === base) return "/";
  if (normalized.startsWith(base + "/")) return normalized.slice(base.length);
  return null;
}

function oauthCallback(config: ResolvedHandlerConfig): HandlerLogic {
  return async (ctx) => {
    const userId = ctx.url.searchParams.get("userId");
    const secret = ctx.url.searchParams.get("secret");
    if (!userId || !secret) {
      return redirectTo(config.redirects.failure, 302);
    }

    const session = await buildAdminAccount(config).createSession({ userId, secret });

    return {
      status: 302,
      redirect: config.redirects.success,
      setCookies: [
        { name: config.cookieName, value: session.secret, options: cookieWriteOptions(config) },
      ],
      clearCookies: [],
    };
  };
}

function oauthFailure(config: ResolvedHandlerConfig): HandlerLogic {
  return async () => redirectTo(config.redirects.failure, 302);
}

function signInEmailPassword(config: ResolvedHandlerConfig): HandlerLogic {
  return async (ctx) => {
    const body = await readJsonBody(ctx);
    const email = stringField(body, "email");
    const password = stringField(body, "password");

    const admin = buildAdminAccount(config);
    const session = await admin.createEmailPasswordSession({ email, password });
    const user = toPlain(await buildSessionClient(config, session.secret).account.get());

    return {
      status: 200,
      body: { type: "json", value: { user } },
      setCookies: [
        { name: config.cookieName, value: session.secret, options: cookieWriteOptions(config) },
      ],
      clearCookies: [],
    };
  };
}

function signUpEmailPassword(config: ResolvedHandlerConfig): HandlerLogic {
  return async (ctx) => {
    const body = await readJsonBody(ctx);
    const email = stringField(body, "email");
    const password = stringField(body, "password");
    const name = optionalStringField(body, "name");
    const userId = optionalStringField(body, "userId") ?? ID.unique();

    const admin = buildAdminAccount(config);
    await admin.create({ userId, email, password, name });
    const session = await admin.createEmailPasswordSession({ email, password });
    const user = toPlain(await buildSessionClient(config, session.secret).account.get());

    return {
      status: 200,
      body: { type: "json", value: { user } },
      setCookies: [
        { name: config.cookieName, value: session.secret, options: cookieWriteOptions(config) },
      ],
      clearCookies: [],
    };
  };
}

function signOut(config: ResolvedHandlerConfig): HandlerLogic {
  return async (ctx) => {
    const sessionSecret = ctx.getCookie(config.cookieName);
    if (sessionSecret) {
      const { account } = buildSessionClient(config, sessionSecret);
      try {
        await account.deleteSession({ sessionId: "current" });
      } catch (err) {
        if (!(err instanceof AppwriteException) || err.code !== 401) throw err;
      }
    }

    return {
      status: 200,
      body: { type: "json", value: { ok: true } },
      setCookies: [],
      clearCookies: [{ name: config.cookieName, options: cookieClearOptions(config) }],
    };
  };
}

function cookieWriteOptions(config: ResolvedHandlerConfig) {
  return { ...config.cookieOptions };
}

function cookieClearOptions(config: ResolvedHandlerConfig) {
  const { path, domain, secure, sameSite } = config.cookieOptions;
  return { path, domain, secure, sameSite };
}

function redirectTo(url: string, status: number): AdapterResponseInit {
  return { status, redirect: url, setCookies: [], clearCookies: [] };
}

function notFound(): AdapterResponseInit {
  return {
    status: 404,
    body: { type: "json", value: { error: "Not found" } },
    setCookies: [],
    clearCookies: [],
  };
}

function errorResponse(err: unknown): AdapterResponseInit {
  if (err instanceof AppwriteException) {
    return {
      status: err.code || 500,
      body: { type: "json", value: { error: err.message, type: err.type } },
      setCookies: [],
      clearCookies: [],
    };
  }
  // node-appwrite throws its own AppwriteException with the same shape; check by duck-typing.
  if (err && typeof err === "object" && "code" in err && "type" in err && "message" in err) {
    const e = err as { code?: number; type?: string; message?: string };
    return {
      status: typeof e.code === "number" && e.code >= 400 ? e.code : 500,
      body: { type: "json", value: { error: e.message ?? "Internal error", type: e.type } },
      setCookies: [],
      clearCookies: [],
    };
  }
  const message = err instanceof Error ? err.message : "Internal error";
  return {
    status: 500,
    body: { type: "json", value: { error: message } },
    setCookies: [],
    clearCookies: [],
  };
}

async function readJsonBody(ctx: AdapterRequestContext): Promise<Record<string, unknown>> {
  const parsed = await ctx.readJson();
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new AppwriteException("Invalid JSON body", 400, "general_argument_invalid");
  }
  return parsed as Record<string, unknown>;
}

function stringField(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new AppwriteException(`Missing field: ${key}`, 400, "general_argument_invalid");
  }
  return value;
}

function optionalStringField(body: Record<string, unknown>, key: string): string | undefined {
  const value = body[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new AppwriteException(`Invalid field: ${key}`, 400, "general_argument_invalid");
  }
  return value;
}
