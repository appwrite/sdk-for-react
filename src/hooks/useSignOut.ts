import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";

type SignOutProps = {
  setAuthenticated: (authenticated: boolean) => void;
};

type SignOutReturnType = (props: { onSuccess?: () => void }) => void;

export function useSignOut({ setAuthenticated }: SignOutProps): SignOutReturnType {
  const { account } = useAppwrite();
  const queryClient = useQueryClient();

  const { mutate: logout } = useMutation({
    mutationFn: (_: { onSuccess?: () => void }) => account.deleteSession({ sessionId: "current" }),
    onSuccess: (_, { onSuccess }) => {
      setAuthenticated(false);
      queryClient.removeQueries({ queryKey: ["auth", "session"] });
      queryClient.removeQueries({ queryKey: ["auth", "user"] });
      onSuccess?.();
    },
  });

  return logout;
}