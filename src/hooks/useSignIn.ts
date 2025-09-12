import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";

export function useSignIn({
  setAuthenticated,
}: {
  setAuthenticated: (authenticated: boolean) => void;
}) {
  const { account } = useAppwrite();
  const queryClient = useQueryClient();

  const { mutate: signInWithEmailPassword, isPending } = useMutation({
    mutationFn: ({
      email,
      password,
    }: {
      email: string;
      password: string;
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }) => account.createEmailPasswordSession({ email, password }),
    onSuccess: (session, { onSuccess }) => {
      queryClient.setQueryData(["auth", "session"], session);
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      setAuthenticated(true);
      onSuccess?.();
    },
    onError: (error, { onError }) => {
      onError?.(error);
    },
  });

  return {
    isPending,
    emailPassword: async ({
      email,
      password,
      onSuccess,
      onError,
    }: {
      email: string;
      password: string;
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }) => {
      signInWithEmailPassword({ email, password, onSuccess, onError });
    },
  };
}
