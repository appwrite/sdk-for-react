import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";

type SignInReturnType = {
  isPending: boolean;
  emailPassword: (props: {
    email: string;
    password: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }) => void;
};

export function useSignIn(): SignInReturnType {
  const { account, setAuthenticated } = useAppwrite();
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
      setAuthenticated(true);
      queryClient.setQueryData(["auth", "session"], session);
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      onSuccess?.();
    },
    onError: (error, { onError }) => {
      onError?.(error);
    },
  });

  return {
    isPending,
    emailPassword: ({ email, password, onSuccess, onError }) => {
      signInWithEmailPassword({ email, password, onSuccess, onError });
    },
  };
}
