import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";
import { ID } from "appwrite";

type SignUpReturnType = {
  /** Whether a sign-up request is currently in progress */
  isPending: boolean;
  /**
   * Create a new user account with email and password, then automatically sign them in.
   *
   * @param email - User's email address
   * @param password - User's password (min 8 characters)
   * @param onSuccess - Optional callback fired on successful sign-up and sign-in
   * @param onError - Optional callback fired on sign-up failure
   */
  emailPassword: (props: {
    email: string;
    password: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }) => void;
};

/**
 * Hook for creating new user accounts with email/password authentication.
 * Automatically signs in the user after successful account creation.
 *
 * @returns Object containing sign-up methods and state
 *
 * @example
 * ```tsx
 * const { emailPassword, isPending } = useSignUp();
 *
 * const handleRegister = () => {
 *   emailPassword({
 *     email: "user@example.com",
 *     password: "password123",
 *     onSuccess: () => console.log("Account created and signed in!"),
 *     onError: (error) => console.error(error),
 *   });
 * };
 * ```
 */
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
