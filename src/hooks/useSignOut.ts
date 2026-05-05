import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";
import { postHandler } from "./internal/handler";

type SignOutReturnType = {
  isPending: boolean;
  /**
   * Sign out the current user.
   *
   * In SSR mode, posts to `{basePath}/sign-out` so the handler can delete the
   * session and clear the cookie. In CSR mode, calls Appwrite directly.
   *
   * After the server-side sign-out succeeds, this hook also resets the local
   * client (clears the `X-Appwrite-Session` header) and removes all cached
   * auth queries — so subsequent reads return null immediately, with no
   * stale-data flash.
   *
   * In Next.js, callers typically also invoke `router.refresh()` from the
   * `onSuccess` callback to re-render server components with the cleared
   * cookie. That step is framework-specific and stays in user code.
   */
  signOut: (options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => void;
};

export function useSignOut(): SignOutReturnType {
  const { account, client, setAuthenticated, ssr } = useAppwrite();
  const queryClient = useQueryClient();

  const { mutate: logout, isPending } = useMutation<void, Error>({
    mutationFn: async () => {
      if (ssr.enabled) {
        await postHandler(ssr.basePath, "/sign-out", {});
        return;
      }
      await account.deleteSession({ sessionId: "current" });
    },
    onSuccess: () => {
      client.setSession("");
      setAuthenticated(false);
      queryClient.removeQueries({ queryKey: ["auth"] });
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
