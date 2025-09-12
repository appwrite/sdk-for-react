import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";
import { ID } from "appwrite";

type SignUpReturnType = {
  isPending: boolean;
  emailPassword: (props: { email: string, password: string, onSuccess?: () => void, onError?: (error: Error) => void }) => Promise<void>;
};

export function useSignUp(): SignUpReturnType {
  const { account } = useAppwrite();
  const queryClient = useQueryClient();

  const { mutate: signUpWithEmailPassword, isPending } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string; onSuccess?: () => void; onError?: (error: Error) => void }) =>
      account.create({  userId: ID.unique(), email, password }),
    onSuccess: (_, { onSuccess }) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
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
    }) => {
      signUpWithEmailPassword({ email, password, onSuccess, onError });
    },
  };
}
