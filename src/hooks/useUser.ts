import { useQuery } from "@tanstack/react-query";
import { AppwriteException, Models } from "appwrite";
import { useEffect, useRef } from "react";
import { useAppwrite } from "@/components/AppwriteProvider";

type UserReturnType = {
  /** The current authenticated user, or null if not authenticated */
  user: Models.User<Models.Preferences> | null | undefined;
  /** Whether the user data is currently being fetched */
  isLoading: boolean;
};

/**
 * Hook for accessing the current authenticated user.
 *
 * In SSR mode (provider has `ssr.session`), the client is already authenticated
 * via setSession; this hook calls `account.get()` directly. There is a brief
 * loading state on first client paint — that's intentional. Apps that want a
 * fully server-rendered user can read it from a server component (RSC / loader)
 * via `getLoggedInUser` and render it there.
 *
 * In CSR mode, this hook fetches the current user; 401 is treated as null.
 */
export function useUser(): UserReturnType {
  const { account, setAuthenticated, ssr } = useAppwrite();

  const hasSession = ssr.enabled ? Boolean(ssr.session) : true;
  const hadServerSession = useRef(hasSession);

  const { data: user, isLoading } = useQuery<Models.User<Models.Preferences> | null>({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      try {
        return await account.get();
      } catch (err) {
        if (err instanceof AppwriteException && err.code === 401) return null;
        throw err;
      }
    },
    enabled: hasSession,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (hasSession) {
      hadServerSession.current = true;
    } else if (hadServerSession.current) {
      hadServerSession.current = false;
      setAuthenticated(false);
      return;
    }
    if (user !== undefined) setAuthenticated(Boolean(user));
  }, [hasSession, setAuthenticated, user]);

  return {
    user,
    isLoading: hasSession && isLoading,
  };
}
