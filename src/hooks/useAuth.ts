import { useUser } from "./useUser";
import { useSignIn } from "./useSignIn";
import { useSignOut } from "./useSignOut";
import { useSignUp } from "./useSignUp";
import { useOAuth } from "./useOAuth";
import { Models } from "appwrite";

type AuthReturnType = {
  /** The current authenticated user, or undefined if not authenticated */
  user: Models.User<Models.Preferences> | undefined;
  /** Whether the authentication state is currently being determined */
  isLoading: boolean;
  /** Sign-up methods and state from useSignUp hook */
  signUp: ReturnType<typeof useSignUp>;
  /** Sign-in methods and state from useSignIn hook */
  signIn: ReturnType<typeof useSignIn>;
  /** Sign-out methods and state from useSignOut hook */
  signOut: ReturnType<typeof useSignOut>;
  /** OAuth methods from useOAuth hook */
  oAuth: ReturnType<typeof useOAuth>;
}

/**
 * Combined hook for all authentication functionality.
 * Provides access to user data, sign-in, sign-up, sign-out, and OAuth methods.
 *
 * @returns Object containing all auth methods and state
 *
 * @example
 * ```tsx
 * const { user, isLoading, signIn, signOut, signUp, oAuth } = useAuth();
 *
 * if (isLoading) return <Spinner />;
 *
 * if (!user) {
 *   return (
 *     <button onClick={() => signIn.emailPassword({ email, password })}>
 *       Sign In
 *     </button>
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
  const oAuth = useOAuth();

  return { user, isLoading, signUp, signIn, signOut, oAuth };
}


