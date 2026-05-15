import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ID, Models } from "appwrite";
import { useAppwrite } from "@/components/AppwriteProvider";
import { postHandler } from "./internal/handler";

type SignUpReturnType = {
  isPending: boolean;
  /**
   * Create a new user account with email and password, then sign them in.
   *
   * In SSR mode, the request is POSTed to `{basePath}/sign-up/email-password`
   * and the handler creates the user, signs them in, and sets the cookie.
   * In CSR mode, the SDK creates the user and session directly.
   */
  emailPassword: (props: {
    email: string;
    password: string;
    name?: string;
    userId?: string;
    onSuccess?: (user: Models.User<Models.Preferences>) => void;
    onError?: (error: Error) => void;
  }) => void;
};

type SignUpVariables = { email: string; password: string; name?: string; userId?: string };
type SignUpResult = { user: Models.User<Models.Preferences> };

export function useSignUp(): SignUpReturnType {
  const { account, setAuthenticated, ssr } = useAppwrite();
  const queryClient = useQueryClient();

  const { mutate: signUp, isPending } = useMutation<SignUpResult, Error, SignUpVariables>({
    mutationFn: async ({ email, password, name, userId }) => {
      if (ssr.enabled) {
        return postHandler<SignUpResult>(ssr.basePath, "/sign-up/email-password", {
          email,
          password,
          name,
          userId,
        });
      }
      await account.create({ userId: userId ?? ID.unique(), email, password, name });
      await account.createEmailPasswordSession({ email, password });
      const user = await account.get();
      return { user };
    },
    onSuccess: ({ user }) => {
      setAuthenticated(true);
      queryClient.setQueryData(["auth", "user"], user);
    },
  });

  return {
    isPending,
    emailPassword: ({ email, password, name, userId, onSuccess, onError }) => {
      signUp(
        { email, password, name, userId },
        {
          onSuccess: ({ user }) => onSuccess?.(user),
          onError: (error) => onError?.(error),
        },
      );
    },
  };
}
