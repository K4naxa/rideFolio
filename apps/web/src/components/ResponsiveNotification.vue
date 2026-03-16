<script setup lang="ts">
import Button from "./ui/button/Button.vue";
import Icon from "./icons/Icon.vue";
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import { queryKeys } from "@/lib/queries/queryKeys";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  DrawerDescription,
} from "@/components/ui/drawer";
import { SIDEBAR_WIDTH, useSidebar } from "@/components/ui/sidebar/utils";
import NotificationsList from "@/components/notifications/NotificationsList.vue";
import { onClickOutside } from "@vueuse/core";
import { useNotifications } from "@/lib/composables/useNotifications.ts";

const isMobile = useIsMobile();
const queryClient = useQueryClient();
const { hasUnreadNotifications } = useNotifications();
const { state: sidebarState } = useSidebar();

const open = ref(false);

// Desktop panel slides in right after the sidebar; tracks sidebar collapse state
const desktopPanelLeft = computed(() => (sidebarState.value === "expanded" ? SIDEBAR_WIDTH : "0px"));
const desktopNotificationPanel = useTemplateRef("DesktopNotificationPanel");
function toggle() {
  if (open.value) {
    close();
  } else {
    // Blur trigger so focus transfers to drawer content,
    // avoiding aria-hidden conflict when two drawers are stacked
    (document.activeElement as HTMLElement)?.blur();
    open.value = true;
  }
}

function close() {
  open.value = false;
  queryClient.invalidateQueries({ queryKey: queryKeys.notification.all });
}

function handleOpenChange(isOpen: boolean) {
  if (!isOpen) close();
  else open.value = true;
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && open.value) close();
}

onClickOutside(desktopNotificationPanel, () => {
  if (open.value) close();
});

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
</script>

<template>
  <!-- Trigger — shared between mobile and desktop -->
  <Button
    variant="outline"
    :aria-activedescendant="open"
    size="icon"
    class="relative shadow-none"
    @click="toggle"
    aria-label="Notifications"
  >
    <Icon name="bell" />

    <div v-if="hasUnreadNotifications" class="absolute top-1 right-1 flex size-2">
      <span class="relative flex size-2">
        <span class="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
        <span class="bg-primary/90 relative inline-flex size-2 rounded-full" />
      </span>
    </div>
  </Button>

  <!-- Mobile: Drawer slides in from left, stacking on top of the sidebar drawer -->
  <Drawer v-if="isMobile" :open="open" @update:open="handleOpenChange" direction="left" :should-scale-background="false">
    <DrawerContent class="bg-background text-foreground rounded-l-none rounded-r p-0">
      <DrawerHeader class="p-4">
        <DrawerTitle class="flex flex-row items-center gap-4">
          <DrawerClose> <Icon name="chevronLeft" /> </DrawerClose> Notifications</DrawerTitle
        >
        <DrawerDescription class="sr-only"> View your unread notifications </DrawerDescription>
      </DrawerHeader>
      <NotificationsList />
      <DrawerFooter>
        <DrawerClose as-child>
          <Button variant="outline" class="w-full">Close</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>

  <!--
    Desktop: Teleport to <body> so the panel lives in the root stacking
    context (z-10, same level as app header.
    Positioned immediately to the right of the sidebar
  -->
  <Teleport v-else to="body">
    <Transition
      class="transition-opacity duration-300"
      enter-from-class="notification-panel-from"
      enter-to-class="notification-panel-enter"
      leave-to-class="notification-panel-from"
    >
      <div
        v-if="open"
        class="bg-background fixed inset-y-0 z-10 flex w-80 flex-col gap-6 border-r shadow-lg"
        :style="{ left: desktopPanelLeft, transition: 'all 0.2s ease' }"
        ref="DesktopNotificationPanel"
      >
        <!-- Header -->
        <div class="flex items-center gap-2 p-4">
          <Button variant="ghost" size="icon-sm" class="shrink-0" @click="close">
            <Icon name="chevronLeft" class="size-4" />
            <span class="sr-only">Close</span>
          </Button>
          <h3 class="">Notifications</h3>
        </div>

        <!-- Notification list -->
        <NotificationsList />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.notification-panel-enter-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.notification-panel-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.notification-panel-from {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
