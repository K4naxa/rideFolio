import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authClient";
import { queryKeys } from "@/lib/queries/queryKeys";
import { addNetworkDelay } from "@/lib/utils";
import { type TBasicProfile, type Notification, type StorageUsageSummary } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";

export function useUserQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["user", "basic-profile"],
    queryFn: async () => await fetchApi<TBasicProfile>("/users/me"),
    enabled: isAuthenticated,
  });
}

export function useUserNotifications() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.user.notifications,
    queryFn: async () => await fetchApi<Notification[]>("/users/notifications"),
    enabled: isAuthenticated,
    placeholderData: [],
  });
}

export function useUserStorageSummary() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["user", "storage-summary"],
    queryFn: async () => {
      await addNetworkDelay(1000);
      return await fetchApi<StorageUsageSummary>("/users/storageSummary");
    },
    enabled: isAuthenticated,
  });
}
