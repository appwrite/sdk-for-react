import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";

export function useSignOut({ setAuthenticated }: { setAuthenticated: (authenticated: boolean) => void }) {
  const { account } = useAppwrite();
  const queryClient = useQueryClient();

  const { mutate: logout } = useMutation({
    mutationFn: () => account.deleteSession({ sessionId: "current" }),
    onSuccess: () => {
      setAuthenticated(false);
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });

  return logout;
}