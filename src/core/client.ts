import { Account, Client } from "appwrite";
import type { ResolvedSsrConfig, SessionServer } from "./types";

export function buildClient(config: Pick<ResolvedSsrConfig, "endpoint" | "projectId">): Client {
  return new Client().setEndpoint(config.endpoint).setProject(config.projectId);
}

export function buildSessionClient(
  config: Pick<ResolvedSsrConfig, "endpoint" | "projectId">,
  session: string,
): SessionServer {
  const client = buildClient(config).setSession(session);
  return { client, account: new Account(client) };
}

export function buildAnonymousClient(
  config: Pick<ResolvedSsrConfig, "endpoint" | "projectId">,
): SessionServer {
  const client = buildClient(config);
  return { client, account: new Account(client) };
}
