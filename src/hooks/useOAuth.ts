import { useCallback } from "react";
import { useAppwrite } from "@/components/AppwriteProvider";
import { OAuthProvider } from "appwrite";

type OAuthReturnType = {
  /**
   * Redirect to OAuth provider for authentication.
   * After successful authentication, the user will be redirected to successUrl.
   *
   * @param provider - OAuth provider (e.g., OAuthProvider.Google, OAuthProvider.Github, or string like "google")
   * @param successUrl - URL to redirect to on success (defaults to current URL)
   * @param failureUrl - URL to redirect to on failure (defaults to current URL)
   * @param scopes - Optional array of OAuth scopes
   */
  signIn: (props: {
    provider: OAuthProvider | string;
    successUrl?: string;
    failureUrl?: string;
    scopes?: string[];
  }) => void;
};

/**
 * Hook for OAuth authentication with third-party providers.
 * Redirects the user to the OAuth provider's login page.
 *
 * @returns Object containing OAuth sign-in method
 *
 * @example
 * ```tsx
 * import { useOAuth, OAuthProvider } from "@appwrite.io/sdk-for-react";
 *
 * const { signIn } = useOAuth();
 *
 * // Using OAuthProvider enum
 * const handleGoogleLogin = () => {
 *   signIn({
 *     provider: OAuthProvider.Google,
 *     successUrl: "/dashboard",
 *     failureUrl: "/login",
 *   });
 * };
 *
 * // Using string
 * const handleGithubLogin = () => {
 *   signIn({ provider: "github" });
 * };
 * ```
 */
export function useOAuth(): OAuthReturnType {
  const { account } = useAppwrite();

  const signIn = useCallback(
    ({
      provider,
      successUrl = typeof window !== "undefined"
        ? window.location.href
        : undefined,
      failureUrl = typeof window !== "undefined"
        ? window.location.href
        : undefined,
      scopes,
    }: {
      provider: OAuthProvider | string;
      successUrl?: string;
      failureUrl?: string;
      scopes?: string[];
    }) => {
      // Convert string to OAuthProvider if needed
      const oauthProvider =
        typeof provider === "string" ? (provider as OAuthProvider) : provider;

      account.createOAuth2Session({
        provider: oauthProvider,
        success: successUrl,
        failure: failureUrl,
        scopes,
      });
    },
    [account]
  );

  return { signIn };
}
