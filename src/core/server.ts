import { AppwriteException } from "appwrite";
import { buildSessionClient } from "./client";
import type { ResolvedSsrConfig, ServerHelpers } from "./types";

/**
 * The web `appwrite` SDK parses responses with `json-bigint` and then assigns
 * a `toString` function to the top-level object. The combination produces
 * objects with non-default prototypes and own functions on nested values —
 * neither is allowed across the React Server Component → Client Component
 * boundary ("Classes or null prototypes are not supported"). We deep-clone
 * to plain Object.prototype shapes so consumers can pass results straight to
 * client component props or React Query initialData without further ceremony.
 *
 * BigInt values would throw under JSON.stringify; the SDK's reviver already
 * down-casts safe-range BigInts to Number, but values outside the int64
 * range are kept as BigInt. We coerce those to string to avoid throwing.
 */
function toPlain<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
  );
}

export function createServerHelpersFromCookieReader(
  config: ResolvedSsrConfig,
  readCookie: () => string | undefined | Promise<string | undefined>,
): ServerHelpers {
  return {
    async createSessionClient() {
      const secret = await readCookie();
      if (!secret) return null;
      return buildSessionClient(config, secret);
    },
    async getSession() {
      const secret = await readCookie();
      if (!secret) return null;
      const { account } = buildSessionClient(config, secret);
      try {
        return toPlain(await account.getSession({ sessionId: "current" }));
      } catch (err) {
        if (err instanceof AppwriteException && err.code === 401) return null;
        throw err;
      }
    },
    async getLoggedInUser() {
      const secret = await readCookie();
      if (!secret) return null;
      const { account } = buildSessionClient(config, secret);
      try {
        return toPlain(await account.get());
      } catch (err) {
        if (err instanceof AppwriteException && err.code === 401) return null;
        throw err;
      }
    },
  };
}
