import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";

type SignOutReturnType = {
  /** Whether a sign-out request is currently in progress */
  isPending: boolean;
  /**
   * Sign out the current user by deleting their session.
   *
   * @param onSuccess - Optional callback fired on successful sign-out
   * @param onError - Optional callback fired on sign-out failure
   */
  signOut: (options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => void;
};

/**
 * Hook for signing out the current user.
 *
 * @returns Object containing sign-out method and state
 *
 * @example
 * ```tsx
 * const { signOut, isPending } = useSignOut();
 *
 * const handleLogout = () => {
 *   signOut({
 *     onSuccess: () => console.log("Signed out!"),
 *     onError: (error) => console.error(error),
 *   });
 * };
 * ```
 */
export function useSignOut(): SignOutReturnType {
  const { account, setAuthenticated } = useAppwrite();
  const queryClient = useQueryClient();

  const { mutate: logout, isPending } = useMutation({
    mutationFn: () => account.deleteSession({ sessionId: "current" }),
    onSuccess: () => {
      setAuthenticated(false);
      queryClient.setQueryData(["auth", "session"], null);
      queryClient.setQueryData(["auth", "user"], null);
    },
  });

  return {
    isPending,
    signOut: (options) => {
      logout(undefined, {
        onSuccess: () => options?.onSuccess?.(),
        onError: (error) => options?.onError?.(error),
      });
    },
  };
}