import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";

type SignInProps = {
  setAuthenticated: (authenticated: boolean) => void;
};

type SignInReturnType = {
  isPending: boolean;
  emailPassword: (props: {
    email: string;
    password: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }) => Promise<void>;
};

export function useSignIn({ setAuthenticated }: SignInProps): SignInReturnType {
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
    emailPassword: async ({ email, password, onSuccess, onError }) => {
      signInWithEmailPassword({ email, password, onSuccess, onError });
    },
  };
}
