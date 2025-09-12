import { useQuery } from "@tanstack/react-query";
import { useAppwrite } from "@/components/AppwriteProvider";
import { Models } from "appwrite";

type UserProps = {
  authenticated: boolean;
};

type UserReturnType = Models.User | undefined;

export function useUser({ authenticated }: UserProps): UserReturnType {
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