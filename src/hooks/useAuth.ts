import { useState } from "react";
import { useUser } from "./useUser";
import { useSignIn } from "./useSignIn";
import { useSignOut } from "./useSignOut";
import { useSignUp } from "./useSignUp";

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  
  const user = useUser({ authenticated });
  const signUp = useSignUp();
  const signIn = useSignIn({ setAuthenticated });
  const signOut = useSignOut({ setAuthenticated });

  return { user, signUp, signIn, signOut };
}


