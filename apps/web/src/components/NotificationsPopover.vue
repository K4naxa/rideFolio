<script setup lang="ts">
import { useUserNotifications } from "@/lib/queries/user/user-queries";
import Button from "./ui/button/Button.vue";
import Icon from "./icons/Icon.vue";
import Separator from "./ui/separator/Separator.vue";
import Label from "./ui/label/Label.vue";
import PopoverTrigger from "./ui/popover/PopoverTrigger.vue";
import Popover from "./ui/popover/Popover.vue";
import PopoverContent from "./ui/popover/PopoverContent.vue";
import type { Notification } from "@repo/validation";
import { useModalStore } from "@/stores/modal";
import { computed, ref } from "vue";
import { useUserNotificationsMarkAsRead } from "@/lib/queries/user/user-mutations";
import { useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "@/lib/queries/queryKeys";

const queryClient = useQueryClient();
const { data: notifications } = useUserNotifications();
const { mutate: markAsRead } = useUserNotificationsMarkAsRead();
const showUnreadIndicator = computed(() =>
  notifications.value ? notifications.value.some((notification) => !notification.isRead) : false,
);
const modalStore = useModalStore();

const open = ref(false);
function handlePopoverClose(isOpen: boolean) {
  if (!isOpen) {
    // refetch updated notifications on close (removes read notifications from the list)
    queryClient.invalidateQueries({ queryKey: queryKeys.user.notifications });
  }
}

function handleNotificationClick(notification: Notification) {
  if (notification.isRead) return;
  if (notification.requiresAction) {
    if (notification.type === "POOL_INVITE") {
      modalStore.onOpen("poolInvite", { notification });
    }
  } else {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  }
}
</script>

<template>
  <Popover v-model:open="open" @update:open="handlePopoverClose" key="notificationsPopover">
    <PopoverTrigger asChild key="notifications">
      <Button variant="ghost" class="relative p-2">
        <Icon name="bell" size="sm" />
        <span class="sr-only">Notification</span>

        <div v-if="showUnreadIndicator" class="absolute top-1 right-1 flex size-2">
          <span class="relative flex size-2">
            <span class="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span class="bg-primary/90 relative inline-flex size-2 rounded-full" />
          </span>
        </div>
      </Button>
    </PopoverTrigger>
    <PopoverContent align="center" class="" key="notificationContent">
      <Label class="text-muted-foreground"> Notifications </Label>
      <Separator class="my-2" />
      <ul v-if="notifications && notifications.length > 0" class="space-y-2">
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
            <h4 class="">
              {{ notification.title }}
            </h4>
            <p class="text-muted-foreground">{{ notification.message }}</p>
          </div>

          <span v-if="!notification.isRead" class="relative flex size-3">
            <span class="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span class="bg-primary/90 relative inline-flex size-3 rounded-full" />
          </span>
        </li>
      </ul>
      <p v-else class="text-muted-foreground my-4 px-4 text-sm">No notifications</p>
    </PopoverContent>
  </Popover>
</template>
