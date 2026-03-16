import { api } from "@/lib/api";
import { useAuth } from "@/lib/authClient";
import { queryKeys } from "@/lib/queries/queryKeys";
import { useQuery } from "@tanstack/vue-query";
import type { Notification } from "@repo/validation";

export function useNotificationsQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.notification.all,
    queryFn: async () => {
      const res = await api.get<Notification[]>("/notifications");
      return res.data;
    },
    enabled: isAuthenticated,
  });
}
