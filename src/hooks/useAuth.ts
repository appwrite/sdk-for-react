import { useState } from "react";
import { useUser } from "./useUser";
import { useSignIn } from "./useSignIn";
import { useSignOut } from "./useSignOut";
import { useSignUp } from "./useSignUp";
import { Models } from "appwrite";

type AuthReturnType = {
  user?: Models.User;
  signUp: ReturnType<typeof useSignUp>;
  signIn: ReturnType<typeof useSignIn>;
  signOut: ReturnType<typeof useSignOut>;
}

export function useAuth(): AuthReturnType {
  const [authenticated, setAuthenticated] = useState(false);
  
  const user = useUser({ authenticated });
  const signUp = useSignUp();
  const signIn = useSignIn({ setAuthenticated });
  const signOut = useSignOut({ setAuthenticated });

  return { user, signUp, signIn, signOut };
}


