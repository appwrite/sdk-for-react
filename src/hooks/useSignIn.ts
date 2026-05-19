import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Models, OAuthProvider } from "appwrite";
import { useAppwrite } from "@/components/AppwriteProvider";
import { OAUTH_STATE_COOKIE_NAME, OAUTH_STATE_MAX_AGE_SECONDS } from "../core/config";
import { postHandler } from "./internal/handler";

type SignInReturnType = {
  /** Whether a sign-in request is currently in progress */
  isPending: boolean;
  /** Error from the last email/password sign-in mutation, if one occurred */
  error: Error | null;
  /**
   * Sign in with email and password.
   *
   * In SSR mode, the credentials are POSTed to the handler at
   * `{basePath}/sign-in/email-password`. The handler creates the session and
   * sets the cookie. In CSR mode, the SDK calls Appwrite directly.
   */
  emailPassword: (props: {
    email: string;
    password: string;
    onSuccess?: (user: Models.User<Models.Preferences>) => void;
    onError?: (error: Error) => void;
  }) => void;
  /**
   * Sign in with OAuth provider. In SSR mode, the success URL points at the
   * handler callback so the server can exchange the token for a session and
   * set the cookie. In CSR mode, the SDK uses createOAuth2Session as before.
   *
   * In SSR mode, post-OAuth redirect is controlled by the handler's
   * `redirects.success` config — `successUrl` is ignored.
   * If the OAuth request fails before redirect, `onError` is called.
   */
  oAuth: (props: {
    provider: OAuthProvider | string;
    successUrl?: string;
    failureUrl?: string;
    scopes?: string[];
    onError?: (error: Error) => void;
  }) => void;
};

type SignInVariables = { email: string; password: string };
type SignInResult = { user: Models.User<Models.Preferences> };

export function useSignIn(): SignInReturnType {
  const { account, setAuthenticated, ssr } = useAppwrite();
  const queryClient = useQueryClient();

  const { mutate: signIn, isPending, error } = useMutation<
    SignInResult,
    Error,
    SignInVariables
  >({
    mutationFn: async ({ email, password }) => {
      if (ssr.enabled) {
        return postHandler<SignInResult>(ssr.basePath, "/sign-in/email-password", {
          email,
          password,
        });
      }
      await account.createEmailPasswordSession({ email, password });
      const user = await account.get();
      return { user };
    },
    onSuccess: ({ user }) => {
      setAuthenticated(true);
      queryClient.setQueryData(["auth", "user"], user);
    },
  });

  const oAuth: SignInReturnType["oAuth"] = ({
    provider,
    successUrl,
    failureUrl,
    scopes,
    onError,
  }) => {
    const oauthProvider = typeof provider === "string" ? (provider as OAuthProvider) : provider;

    if (ssr.enabled) {
      if (typeof window === "undefined") {
        const error = new Error("[appwrite-react] oAuth must be called in the browser");
        if (onError) {
          onError(error);
          return;
        }
        throw error;
      }
      const origin = window.location.origin;
      let success: URL;
      try {
        const state = createOAuthState();
        success = new URL(`${origin}${ssr.basePath}/oauth/callback`);
        success.searchParams.set("state", state);
        setOAuthStateCookie(ssr.basePath, state);
      } catch (err) {
        if (onError) {
          onError(toError(err));
          return;
        }
        throw err;
      }

      startOAuth(
        () =>
          account.createOAuth2Token({
            provider: oauthProvider,
            success: success.toString(),
            failure: failureUrl ?? `${origin}${ssr.basePath}/oauth/failure`,
            scopes,
          }),
        onError,
      );
      return;
    }

    startOAuth(
      () =>
        account.createOAuth2Session({
          provider: oauthProvider,
          success: successUrl ?? (typeof window !== "undefined" ? window.location.href : undefined),
          failure: failureUrl ?? (typeof window !== "undefined" ? window.location.href : undefined),
          scopes,
        }),
      onError,
    );
  };

  return {
    isPending,
    error,
    emailPassword: ({ email, password, onSuccess, onError }) => {
      signIn(
        { email, password },
        {
          onSuccess: ({ user }) => onSuccess?.(user),
          onError: (error) => onError?.(error),
        },
      );
    },
    oAuth,
  };
}

function startOAuth(createResult: () => unknown, onError?: (error: Error) => void) {
  try {
    Promise.resolve(createResult()).catch((err) => {
      onError?.(toError(err));
    });
  } catch (err) {
    onError?.(toError(err));
  }
}

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

function createOAuthState(): string {
  const crypto = globalThis.crypto;
  if (!crypto) {
    throw new Error("[appwrite-react] crypto is required for OAuth state generation");
  }
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function setOAuthStateCookie(basePath: string, state: string) {
  const path = basePath.replace(/\/+$/, "") || "/";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(OAUTH_STATE_COOKIE_NAME)}=${encodeURIComponent(
    state,
  )}; Path=${path}; Max-Age=${OAUTH_STATE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}
