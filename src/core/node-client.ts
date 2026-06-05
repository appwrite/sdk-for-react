import {
  Account as NodeAccount,
  Activities as NodeActivities,
  Advisor as NodeAdvisor,
  Avatars as NodeAvatars,
  Backups as NodeBackups,
  Client as NodeClient,
  Databases as NodeDatabases,
  Functions as NodeFunctions,
  Graphql as NodeGraphql,
  Health as NodeHealth,
  Locale as NodeLocale,
  Messaging as NodeMessaging,
  Organization as NodeOrganization,
  Presences as NodePresences,
  Project as NodeProject,
  Proxy as NodeProxy,
  Sites as NodeSites,
  Storage as NodeStorage,
  TablesDB as NodeTablesDB,
  Teams as NodeTeams,
  Tokens as NodeTokens,
  Usage as NodeUsage,
  Users as NodeUsers,
  Webhooks as NodeWebhooks,
} from "node-appwrite";
import type { AdminServer, NodeSessionServer, ResolvedSsrConfig } from "./types";

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

export function buildAdminClient(
  config: Pick<ResolvedSsrConfig, "endpoint" | "projectId">,
  apiKey: string,
): AdminServer {
  const client = new NodeClient()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(apiKey);
  return {
    client,
    account: new NodeAccount(client),
    activities: new NodeActivities(client),
    advisor: new NodeAdvisor(client),
    avatars: new NodeAvatars(client),
    backups: new NodeBackups(client),
    databases: new NodeDatabases(client),
    functions: new NodeFunctions(client),
    graphql: new NodeGraphql(client),
    health: new NodeHealth(client),
    locale: new NodeLocale(client),
    messaging: new NodeMessaging(client),
    organization: new NodeOrganization(client),
    presences: new NodePresences(client),
    project: new NodeProject(client),
    proxy: new NodeProxy(client),
    sites: new NodeSites(client),
    storage: new NodeStorage(client),
    tablesDB: new NodeTablesDB(client),
    teams: new NodeTeams(client),
    tokens: new NodeTokens(client),
    usage: new NodeUsage(client),
    users: new NodeUsers(client),
    webhooks: new NodeWebhooks(client),
  };
}
