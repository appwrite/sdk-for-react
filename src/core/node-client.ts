import { Account as NodeAccount, Client as NodeClient } from "node-appwrite";
import type { NodeSessionServer, ResolvedSsrConfig } from "./types";

export function buildNodeSessionClient(
  config: ResolvedSsrConfig,
  session: string,
): NodeSessionServer {
  const client = new NodeClient()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setSession(session);
  return { client, account: new NodeAccount(client) };
}
