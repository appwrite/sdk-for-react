import { AppwriteException } from "node-appwrite";
import { buildAdminClient, buildNodeSessionClient } from "./node-client";
import { toPlain } from "./utils";
import type { ResolvedServerConfig, ServerHelpers } from "./types";

export function createServerHelpersFromCookieReader(
  config: ResolvedServerConfig,
  readCookie: () => string | undefined | Promise<string | undefined>,
): ServerHelpers {
  return {
    async createSessionClient() {
      const secret = await readCookie();
      if (!secret) return null;
      return buildNodeSessionClient(config, secret);
    },
    async getSession() {
      const secret = await readCookie();
      if (!secret) return null;
      const { account } = buildNodeSessionClient(config, secret);
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
      const { account } = buildNodeSessionClient(config, secret);
      try {
        return toPlain(await account.get());
      } catch (err) {
        if (err instanceof AppwriteException && err.code === 401) return null;
        throw err;
      }
    },
    createAdminClient() {
      if (!config.apiKey) {
        throw new Error("[appwrite-react] config.apiKey is required for createAdminClient()");
      }
      return buildAdminClient(config, config.apiKey);
    },
  };
}
