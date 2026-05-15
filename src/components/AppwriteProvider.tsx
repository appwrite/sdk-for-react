import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Account, Client } from "appwrite";
import { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_BASE_PATH } from "../core/config";

export interface AppwriteSsrProps {
  /**
   * Session secret read from the server-side cookie. When present, the SDK
   * is in SSR mode: writes (sign-in, sign-up, sign-out) are routed through
   * the handler at `basePath`, and the cookie is owned by the server.
   */
  session?: string | null;
  /**
   * Mount path of the Appwrite handlers. Must match the path you pass to
   * `createAppwriteHandlers` in your route file. Defaults to `/api/appwrite`.
   */
  basePath?: string;
}

interface AppwriteContextValue {
  client: Client;
  account: Account;
  authenticated: boolean;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  ssr: {
    enabled: boolean;
    basePath: string;
    session: string | null;
  };
}

const AppwriteContext = createContext<AppwriteContextValue | null>(null);

export interface AppwriteProviderProps {
  endpoint: string;
  projectId: string;
  ssr?: AppwriteSsrProps;
  children: React.ReactNode;
}

export function AppwriteProvider({
  endpoint,
  projectId,
  ssr,
  children,
}: AppwriteProviderProps) {
  // Per-instance QueryClient. Module-level singletons are a cross-request
  // cache leak in SSR — each Node request would reuse the previous user's
  // cache. useState's lazy initializer runs once per mount: per-request on
  // the server, once per page load on the client.
  const [queryClient] = useState(() => new QueryClient());

  const [authenticated, setAuthenticated] = useState(() => Boolean(ssr?.session));

  const { client, account } = useMemo(() => {
    const c = new Client().setEndpoint(endpoint).setProject(projectId);
    if (ssr?.session) c.setSession(ssr.session);
    return { client: c, account: new Account(c) };
  }, [endpoint, projectId, ssr?.session]);

  const ssrEnabled = ssr !== undefined;

  const ssrConfig = useMemo(
    () => ({
      enabled: ssrEnabled,
      basePath: ssr?.basePath ?? DEFAULT_BASE_PATH,
      session: ssr?.session ?? null,
    }),
    [ssrEnabled, ssr?.basePath, ssr?.session],
  );

  const contextValue = useMemo<AppwriteContextValue>(
    () => ({
      client,
      account,
      authenticated,
      setAuthenticated,
      ssr: ssrConfig,
    }),
    [client, account, authenticated, ssrConfig],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppwriteContext.Provider value={contextValue}>
        {children}
      </AppwriteContext.Provider>
    </QueryClientProvider>
  );
}

export function useAppwrite() {
  const ctx = useContext(AppwriteContext);
  if (!ctx) throw new Error("useAppwrite must be used within an AppwriteProvider");
  return ctx;
}
