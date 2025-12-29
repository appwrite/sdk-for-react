import { useUser } from "./useUser";
import { useSignIn } from "./useSignIn";
import { useSignOut } from "./useSignOut";
import { useSignUp } from "./useSignUp";
import { useOAuth } from "./useOAuth";
import { Models } from "appwrite";

type AuthReturnType = {
  user: Models.User<Models.Preferences> | undefined;
  isLoading: boolean;
  signUp: ReturnType<typeof useSignUp>;
  signIn: ReturnType<typeof useSignIn>;
  signOut: ReturnType<typeof useSignOut>;
  oAuth: ReturnType<typeof useOAuth>;
}

export function useAuth(): AuthReturnType {
  const { user, isLoading } = useUser();
  const signUp = useSignUp();
  const signIn = useSignIn();
  const signOut = useSignOut();
  const oAuth = useOAuth();

  return { user, isLoading, signUp, signIn, signOut, oAuth };
}


