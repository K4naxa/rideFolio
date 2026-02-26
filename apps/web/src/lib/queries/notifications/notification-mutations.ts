import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "../queryKeys";
import type { Notification } from "@repo/validation";

export function userNotificationMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["notification", "mark-as-read"],
    mutationFn: async (notificationId: string) => await api.post(`notifications/${notificationId}/read`),
    onSuccess: (_, variable) => {
      queryClient.setQueryData<Notification[]>(queryKeys.notification.all, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((notification) =>
          notification.id === variable ? { ...notification, read: true } : notification,
        );
      });
    },
  });
}
