<script setup lang="ts">
import { useNotificationsQuery } from "@/lib/queries/notifications/notification-queries.ts";
import GroupInvitationModal from "@/modals/GroupInvitationModal.vue";
import { userNotificationMarkAsRead } from "@/lib/queries/notifications/notification-mutations.ts";
import { ref } from "vue";
import type { Notification } from "@repo/validation";
import { isNotificationType } from "@repo/validation";

const { data: notifications } = useNotificationsQuery();
const { mutate: markAsRead } = userNotificationMarkAsRead();

const showGroupInviteModal = ref(false);
const groupInviteModalData = ref<Notification<"GROUP_INVITE"> | null>(null);

function handleNotificationClick(notification: Notification) {
  if (notification.isRead) return;
  if (!notification.requiresAction) {
    markAsRead(notification.id);
    return;
  }

  if (isNotificationType(notification, "GROUP_INVITE")) {
    groupInviteModalData.value = notification;
    showGroupInviteModal.value = true;
  }
}
</script>

<template>
  <ul v-if="notifications && notifications.length > 0" class="space-y-2 p-2">
    <li
      v-for="notification in notifications"
      :key="notification.id"
      :role="notification.requiresAction ? 'button' : undefined"
      :tabindex="notification.requiresAction ? 0 : undefined"
      class="listHover grid grid-cols-[1fr_1rem] items-center gap-2 rounded-md p-2 px-3"
      :class="[
        notification.requiresAction ? 'cursor-pointer' : 'cursor-default',
        notification.isRead ? '' : 'bg-sidebar-accent',
      ]"
      @click="handleNotificationClick(notification)"
      @keydown.enter="handleNotificationClick(notification)"
      @keydown.space.prevent="handleNotificationClick(notification)"
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

  <GroupInvitationModal
    v-if="groupInviteModalData"
    :notification="groupInviteModalData"
    v-model:open="showGroupInviteModal"
  />
</template>
