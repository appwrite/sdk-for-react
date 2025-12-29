import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Account, Client } from "appwrite";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const queryClient = new QueryClient();

type AppwriteContext = {
  account: Account;
  authenticated: boolean;
  setAuthenticated: (authenticated: boolean) => void;
};

const AppwriteContext = createContext<AppwriteContext | null>(null);

export function AppwriteProvider({
  endpoint,
  projectId,
  children,
}: {
  endpoint: string;
  projectId: string;
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticatedState] = useState(false);
  const setAuthenticated = useCallback((value: boolean) => setAuthenticatedState(value), []);

  const account = useMemo(() => {
    const client = new Client().setEndpoint(endpoint).setProject(projectId);
    return new Account(client);
  }, [endpoint, projectId]);

  const context = useMemo<AppwriteContext>(
    () => ({ account, authenticated, setAuthenticated }),
    [account, authenticated, setAuthenticated]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppwriteContext.Provider value={context}>
        {children}
      </AppwriteContext.Provider>
    </QueryClientProvider>
  );
}

export function useAppwrite() {
  const context = useContext(AppwriteContext);

  if (!context) {
    throw new Error("useAppwrite must be used within an AppwriteProvider");
  }

  return context;
}
