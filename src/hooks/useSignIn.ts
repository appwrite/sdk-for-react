import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";
import { OAuthProvider } from "appwrite";

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
  /**
   * Sign in with OAuth provider. Redirects to the provider's login page.
   * Also handles account creation if the user doesn't exist.
   *
   * @param provider - OAuth provider (e.g., OAuthProvider.Google, OAuthProvider.Github, or string like "google")
   * @param successUrl - URL to redirect to on success (defaults to current URL)
   * @param failureUrl - URL to redirect to on failure (defaults to current URL)
   * @param scopes - Optional array of OAuth scopes
   */
  oAuth: (props: {
    provider: OAuthProvider | string;
    successUrl?: string;
    failureUrl?: string;
    scopes?: string[];
  }) => void;
};

/**
 * Hook for signing in users with email/password or OAuth authentication.
 *
 * @returns Object containing sign-in methods and state
 *
 * @example
 * ```tsx
 * import { useSignIn, OAuthProvider } from "@appwrite.io/sdk-for-react";
 *
 * const { emailPassword, oAuth, isPending } = useSignIn();
 *
 * // Email/password sign in
 * const handleLogin = () => {
 *   emailPassword({
 *     email: "user@example.com",
 *     password: "password123",
 *     onSuccess: () => console.log("Signed in!"),
 *     onError: (error) => console.error(error),
 *   });
 * };
 *
 * // OAuth sign in
 * const handleGoogleLogin = () => {
 *   oAuth({
 *     provider: OAuthProvider.Google,
 *     successUrl: "/dashboard",
 *     failureUrl: "/login",
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

  const oAuth = ({
    provider,
    successUrl = typeof window !== "undefined" ? window.location.href : undefined,
    failureUrl = typeof window !== "undefined" ? window.location.href : undefined,
    scopes,
  }: {
    provider: OAuthProvider | string;
    successUrl?: string;
    failureUrl?: string;
    scopes?: string[];
  }) => {
    const oauthProvider = typeof provider === "string" ? (provider as OAuthProvider) : provider;

    account.createOAuth2Token({
      provider: oauthProvider,
      success: successUrl,
      failure: failureUrl,
      scopes,
    });
  };

  return {
    isPending,
    emailPassword: ({ email, password, onSuccess, onError }) => {
      signInWithEmailPassword({ email, password, onSuccess, onError });
    },
    oAuth,
  };
}
