import { AppwriteException } from "node-appwrite";
import { buildAdminClient, buildNodeSessionClient } from "./node-client";
import { toPlain } from "./utils";
import type {
  AdminServerHelpers,
  ResolvedAdminServerConfig,
  ResolvedServerConfig,
  ResolvedServerConfigWithoutApiKey,
  ServerHelpers,
} from "./types";

export function createServerHelpersFromCookieReader(
  config: ResolvedAdminServerConfig,
  readCookie: () => string | undefined | Promise<string | undefined>,
): AdminServerHelpers;

export function createServerHelpersFromCookieReader(
  config: ResolvedServerConfigWithoutApiKey,
  readCookie: () => string | undefined | Promise<string | undefined>,
): ServerHelpers;

export function createServerHelpersFromCookieReader(
  config: ResolvedServerConfig,
  readCookie: () => string | undefined | Promise<string | undefined>,
): AdminServerHelpers | ServerHelpers;

export function createServerHelpersFromCookieReader(
  config: ResolvedServerConfig,
  readCookie: () => string | undefined | Promise<string | undefined>,
): ServerHelpers | AdminServerHelpers {
  const helpers: ServerHelpers = {
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
  };

  const apiKey = config.apiKey;
  if (!apiKey) {
    return helpers;
  }

  return {
    ...helpers,
    createAdminClient() {
      return buildAdminClient(config, apiKey);
    },
  };
}
