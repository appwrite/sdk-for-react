import { useUser } from "./useUser";
import { useSignIn } from "./useSignIn";
import { useSignOut } from "./useSignOut";
import { useSignUp } from "./useSignUp";
import { Models } from "appwrite";

type AuthReturnType = {
  /** The current authenticated user, or null/undefined if not authenticated */
  user: Models.User<Models.Preferences> | null | undefined;
  /** Whether the authentication state is currently being determined */
  isLoading: boolean;
  /** Sign-up methods and state from useSignUp hook */
  signUp: ReturnType<typeof useSignUp>;
  /** Sign-in methods and state from useSignIn hook (includes OAuth) */
  signIn: ReturnType<typeof useSignIn>;
  /** Sign-out methods and state from useSignOut hook */
  signOut: ReturnType<typeof useSignOut>;
}

/**
 * Combined hook for all authentication functionality.
 * Provides access to user data, sign-in, sign-up, and sign-out methods.
 *
 * @returns Object containing all auth methods and state
 *
 * @example
 * ```tsx
 * import { useAuth, OAuthProvider } from "@appwrite.io/sdk-for-react";
 *
 * const { user, isLoading, signIn, signOut, signUp } = useAuth();
 *
 * if (isLoading) return <Spinner />;
 *
 * if (!user) {
 *   return (
 *     <>
 *       <button onClick={() => signIn.emailPassword({ email, password })}>
 *         Sign In
 *       </button>
 *       <button onClick={() => signIn.oAuth({ provider: OAuthProvider.Google })}>
 *         Sign In with Google
 *       </button>
 *     </>
 *   );
 * }
 *
 * return (
 *   <div>
 *     Welcome, {user.name}!
 *     <button onClick={() => signOut.signOut()}>Sign Out</button>
 *   </div>
 * );
 * ```
 */
export function useAuth(): AuthReturnType {
  const { user, isLoading } = useUser();
  const signUp = useSignUp();
  const signIn = useSignIn();
  const signOut = useSignOut();

  return { user, isLoading, signUp, signIn, signOut };
}


