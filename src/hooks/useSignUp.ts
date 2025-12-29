import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";
import { ID } from "appwrite";

type SignUpReturnType = {
  isPending: boolean;
  emailPassword: (props: { email: string; password: string; onSuccess?: () => void; onError?: (error: Error) => void }) => void;
};

export function useSignUp(): SignUpReturnType {
  const { account, setAuthenticated } = useAppwrite();
  const queryClient = useQueryClient();

  const { mutate: signUpWithEmailPassword, isPending } = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // Create the user account
      await account.create({ userId: ID.unique(), email, password });
      // Automatically sign in after signup
      const session = await account.createEmailPasswordSession({ email, password });
      return session;
    },
    onSuccess: (session) => {
      setAuthenticated(true);
      queryClient.setQueryData(["auth", "session"], session);
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });

  return {
    isPending,
    emailPassword: ({ email, password, onSuccess, onError }) => {
      signUpWithEmailPassword(
        { email, password },
        {
          onSuccess: () => onSuccess?.(),
          onError: (error) => onError?.(error),
        }
      );
    },
  };
}
