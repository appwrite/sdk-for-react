import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";

type SignInReturnType = {
  /** Whether a sign-in request is currently in progress */
  isPending: boolean;
  /**
   * Sign in with email and password.
   *
   * @param email - User's email address
   * @param password - User's password
   * @param onSuccess - Optional callback fired on successful sign-in
   * @param onError - Optional callback fired on sign-in failure
   */
  emailPassword: (props: {
    email: string;
    password: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }) => void;
};

/**
 * Hook for signing in users with email/password authentication.
 *
 * @returns Object containing sign-in methods and state
 *
 * @example
 * ```tsx
 * const { emailPassword, isPending } = useSignIn();
 *
 * const handleLogin = () => {
 *   emailPassword({
 *     email: "user@example.com",
 *     password: "password123",
 *     onSuccess: () => console.log("Signed in!"),
 *     onError: (error) => console.error(error),
 *   });
 * };
 * ```
 */
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
