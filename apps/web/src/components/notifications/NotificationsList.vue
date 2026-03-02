<script setup lang="ts">
import { useNotificationsQuery } from "@/lib/queries/notifications/notification-queries.ts";
import PoolInvitationModal from "@/modals/PoolInvitationModal.vue";
import { userNotificationMarkAsRead } from "@/lib/queries/notifications/notification-mutations.ts";
import { ref } from "vue";
import type { Notification } from "@repo/validation";
import { isNotificationType } from "@repo/validation";

const { data: notifications } = useNotificationsQuery();
const { mutate: markAsRead } = userNotificationMarkAsRead();

const showPoolInviteModal = ref(false);
const poolInviteModalData = ref<Notification<"POOL_INVITE"> | null>(null);

function handleNotificationClick(notification: Notification) {
  if (notification.isRead) return;
  if (!notification.requiresAction) {
    markAsRead(notification.id);
    return;
  }

  if (isNotificationType(notification, "POOL_INVITE")) {
    poolInviteModalData.value = notification;
    showPoolInviteModal.value = true;
  }
}
</script>

<template>
  <ul v-if="notifications && notifications.length > 0" class="space-y-2 px-2">
    <li
      v-for="notification in notifications"
      :key="notification.id"
      class="listHover grid grid-cols-[1fr_1rem] items-center gap-2 rounded-md p-2"
      :class="[
        notification.requiresAction ? 'cursor-pointer' : 'cursor-default',
        notification.isRead ? 'bg-background' : 'bg-accent/50',
      ]"
      @click="handleNotificationClick(notification)"
    >
      <div>
        <h3>{{ notification.title }}</h3>
        <p class="text-muted-foreground text-sm">{{ notification.message }}</p>
      </div>
      <span v-if="!notification.isRead" class="relative flex size-3">
        <span class="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
        <span class="bg-primary/90 relative inline-flex size-3 rounded-full" />
      </span>
    </li>
  </ul>
  <p v-else class="text-muted-foreground my-4 px-4 text-center text-sm">No pending notifications</p>

  <PoolInvitationModal
    v-if="poolInviteModalData"
    :notification="poolInviteModalData"
    v-model:open="showPoolInviteModal"
  />
</template>

<style scoped></style>
