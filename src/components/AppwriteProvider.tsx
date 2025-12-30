import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Account, Client } from "appwrite";
import { createContext, useContext, useMemo, useState } from "react";

const queryClient = new QueryClient();

type AppwriteContext = {
  account: Account;
  authenticated: boolean;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [authenticated, setAuthenticated] = useState(false);

  const account = useMemo(() => {
    const client = new Client().setEndpoint(endpoint).setProject(projectId);
    return new Account(client);
  }, [endpoint, projectId]);

  const context = useMemo<AppwriteContext>(
    () => ({ account, authenticated, setAuthenticated }),
    [account, authenticated]
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
