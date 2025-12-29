import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";

type SignOutReturnType = {
  isPending: boolean;
  signOut: (options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => void;
};

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