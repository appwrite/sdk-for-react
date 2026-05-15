import { AppwriteException } from "appwrite";
import { buildSessionClient } from "./client";
import { toPlain } from "./utils";
import type { ResolvedSsrConfig, ServerHelpers } from "./types";

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
