<script setup lang="ts">
import Button from "./ui/button/Button.vue";
import Icon from "./icons/Icon.vue";
import Separator from "./ui/separator/Separator.vue";
import Label from "./ui/label/Label.vue";
import PopoverTrigger from "./ui/popover/PopoverTrigger.vue";
import Popover from "./ui/popover/Popover.vue";
import PopoverContent from "./ui/popover/PopoverContent.vue";
import { isNotificationType, type Notification } from "@repo/validation";
import { computed, ref } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "@/lib/queries/queryKeys";
import PoolInvitationModal from "@/modals/PoolInvitationModal.vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import Sheet from "@/components/ui/sheet/Sheet.vue";
import SheetHeader from "@/components/ui/sheet/SheetHeader.vue";
import SheetTitle from "@/components/ui/sheet/SheetTitle.vue";
import SheetDescription from "@/components/ui/sheet/SheetDescription.vue";
import SheetFooter from "@/components/ui/sheet/SheetFooter.vue";
import SheetClose from "@/components/ui/sheet/SheetClose.vue";
import SheetContent from "@/components/ui/sheet/SheetContent.vue";
import SheetTrigger from "@/components/ui/sheet/SheetTrigger.vue";
import { useNotificationsQuery } from "@/lib/queries/notifications/notification-queries";
import { userNotificationMarkAsRead } from "@/lib/queries/notifications/notification-mutations";

const queryClient = useQueryClient();
const { data: notifications } = useNotificationsQuery();
const { mutate: markAsRead } = userNotificationMarkAsRead();
const showUnreadIndicator = computed(() => (notifications.value ? notifications.value.length > 0 : false));

const showPoolInviteModal = ref(false);
const poolInviteModalData = ref<Notification<"POOL_INVITE"> | null>(null);

const open = ref(false);
function handlePopoverClose(isOpen: boolean) {
  if (!isOpen) {
    // refetch updated notifications on close (removes read notifications from the list)
    queryClient.invalidateQueries({ queryKey: queryKeys.notification.all });
  }
}

function handleNotificationClick(notification: Notification) {
  if (notification.isRead) return;
  if (!notification.requiresAction) {
    if (!notification.isRead) {
      console.log("marking notification read");
      markAsRead(notification.id);
    }
    return;
  }

  // Notifications that require user input or validation to be discarded
  if (isNotificationType(notification, "POOL_INVITE")) {
    poolInviteModalData.value = notification;
    showPoolInviteModal.value = true;
  }
}

const isMobile = useIsMobile();
</script>

<template>
  <template v-if="!isMobile">
    <Popover v-model:open="open" @update:open="handlePopoverClose" key="notificationsPopover">
      <PopoverTrigger asChild key="notifications">
        <Button variant="ghost" class="relative p-2" :class="open && 'bg-muted border-border'">
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
      <PopoverContent class="w-xs" key="notificationContent" align="end">
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
              <p class="text-muted-foreground text-sm">{{ notification.message }}</p>
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

  <template v-else>
    <Sheet>
      <SheetTrigger asChild key="notifications">
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
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle> Notifications </SheetTitle>
          <SheetDescription> View and manage your notifications here. </SheetDescription>
        </SheetHeader>
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
              <h3 class="">
                {{ notification.title }}
              </h3>
              <p class="text-muted-foreground text-sm">{{ notification.message }}</p>
            </div>

            <span v-if="!notification.isRead" class="relative flex size-3">
              <span class="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span class="bg-primary/90 relative inline-flex size-3 rounded-full" />
            </span>
          </li>
        </ul>
        <p v-else class="text-muted-foreground my-4 px-4 text-center text-sm">No pending notifications</p>
        <SheetFooter>
          <SheetClose asChild> <Button variant="outline" class="w-full">Close</Button></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </template>

  <PoolInvitationModal
    v-if="poolInviteModalData"
    :notification="poolInviteModalData"
    v-model:open="showPoolInviteModal"
  />
</template>
