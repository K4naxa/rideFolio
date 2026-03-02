import { useNotificationsQuery } from "@/lib/queries/notifications/notification-queries.ts";
import { computed } from "vue";

export function useNotifications() {
  const { data: notifications, isLoading: isLoadingNotifications } = useNotificationsQuery();

  const hasUnreadNotifications = computed(() => notifications.value?.some((notification) => !notification.isRead));

  return {
    notifications,
    isLoadingNotifications,
    hasUnreadNotifications,
  };
}
