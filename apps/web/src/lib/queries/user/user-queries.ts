import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authClient";
import { queryKeys } from "@/lib/queries/queryKeys";
import { addNetworkDelay } from "@/lib/utils";
import { type TBasicProfile, type Notification, type StorageBreakdown } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";

export function useUserQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["user", "basic-profile"],
    queryFn: async () => await fetchApi<TBasicProfile>("/users/me"),
    enabled: isAuthenticated,
  });
}

export function useStorageBreakdown() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["user", "storage-breakdown"],
    queryFn: async () => {
      await addNetworkDelay(1000);
      return await fetchApi<StorageBreakdown>("/users/storageBreakdown");
    },
    enabled: isAuthenticated,
  });
}
