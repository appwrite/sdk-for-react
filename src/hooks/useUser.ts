import { useQuery } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";
import { Models } from "appwrite";

export function useUser({ authenticated }: { authenticated: boolean }): Models.User | undefined {
  const { account } = useAppwrite();

  const { data: session } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => account.getSession({ sessionId: "current" }),
    enabled: authenticated,
  });

  const { data: user } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: () => account.get(),
    enabled: !!session,
  });

  return user;
}