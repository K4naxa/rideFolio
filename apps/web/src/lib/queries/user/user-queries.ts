import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authClient";
import { queryKeys } from "@/lib/queries/queryKeys";
import type { TBasicProfile, Notification } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";

export function useUserQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["currentUser"],
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
