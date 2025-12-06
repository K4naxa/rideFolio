import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authClient";
import type { TBasicProfile } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";

export function useUserQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => await fetchApi<TBasicProfile>("/users/me"),
    enabled: isAuthenticated,
  });
}
