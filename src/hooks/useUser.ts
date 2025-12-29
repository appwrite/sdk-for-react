import { useQuery } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";
import { Models } from "appwrite";
import { useEffect } from "react";

type UserReturnType = {
  /** The current authenticated user, or undefined if not authenticated */
  user: Models.User<Models.Preferences> | undefined;
  /** Whether the user data is currently being fetched */
  isLoading: boolean;
};

/**
 * Hook for accessing the current authenticated user.
 * Automatically checks for an existing session on mount and fetches user data.
 *
 * @returns Object containing user data and loading state
 *
 * @example
 * ```tsx
 * const { user, isLoading } = useUser();
 *
 * if (isLoading) return <Spinner />;
 * if (!user) return <LoginPage />;
 *
 * return <div>Welcome, {user.name}!</div>;
 * ```
 */
export function useUser(): UserReturnType {
  const { account, authenticated, setAuthenticated } = useAppwrite();

  // Check for existing session on mount
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => account.getSession({ sessionId: "current" }),
    retry: false,
    staleTime: Infinity,
  });

  // Update authenticated state when session is found
  useEffect(() => {
    if (session && !authenticated) {
      setAuthenticated(true);
    }
  }, [session, authenticated, setAuthenticated]);

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: () => account.get(),
    enabled: !!session,
    retry: false,
  });

  return {
    user,
    isLoading: isSessionLoading || (!!session && isUserLoading),
  };
}