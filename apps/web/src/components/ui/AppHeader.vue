<script setup lang="ts">
import { computed } from "vue";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useRoute } from "vue-router";
import AppHeaderProfileButton from "./AppHeaderProfileButton.vue";
import { useModalStore } from "@/stores/modal";
import { twMerge } from "tailwind-merge";
import Icons from "../icons/Icon.vue";
import { useCurrentPool } from "@/lib/composables/useCurrentPool";
import NotificationsPopover from "../NotificationsPopover.vue";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import Icon from "../icons/Icon.vue";

const route = useRoute();
const modalStore = useModalStore();
const { currentVehicleName } = useCurrentVehicle();
const { currentPoolName } = useCurrentPool();

const title = computed(() => {
  if (currentVehicleName.value) return `${currentVehicleName.value} ${route.name?.toString()}`;
  if (currentPoolName.value) return `${currentPoolName.value} ${route.name?.toString()}`;
  return route.name?.toString() ?? "RideFolio";
});

type IconName = "refill" | "maintenance" | "notes" | "todo" | "bell";

interface AppHeaderButton {
  label: string;
  icon: IconName;
  onClick: () => void;
  class: string;
  cypressDataAttr: string;
}

const headerButtons = computed<AppHeaderButton[]>(() => [
  {
    label: "Refill",
    icon: "refill",
    onClick: () => modalStore.onOpen("createRefill"),
    class: "hover:shadow-refill/50 ",
    cypressDataAttr: "create-refill-button",
  },
  {
    label: "Maintenance",
    icon: "maintenance",
    onClick: () => modalStore.onOpen("createMaintenance"),
    class: "hover:shadow-maintenance/50 ",
    cypressDataAttr: "create-maintenance-button",
  },
  {
    label: "Note",
    icon: "notes",
    onClick: () => modalStore.onOpen("createNote"),
    class: "hover:shadow-notes/50 ",
    cypressDataAttr: "create-note-button",
  },
  {
    label: "Todo",
    icon: "todo",
    onClick: () => modalStore.onOpen("createTodo"),
    class: "hover:shadow-todo/50 ",
    cypressDataAttr: "create-todo-button",
  },
]);
</script>

<template>
  <header
    class="bg-background sticky top-0 z-20 flex h-(--app-header-height) w-full shrink-0 items-center gap-2 border-b px-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) lg:px-6"
  >
    <div class="flex w-full items-center gap-1 overflow-hidden lg:gap-2">
      <SidebarTrigger class="-ml-1" />
      <Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
      <h3 class="truncate">{{ title }}</h3>
    </div>
    <div class="ml-auto hidden items-center gap-2 pr-4 text-sm md:flex lg:pr-6">
      <Button
        variant="outline"
        v-for="button in headerButtons"
        :key="button.label"
        @click="button.onClick"
        :class="twMerge('hover:bg-background font-medium hover:shadow-md', button.class)"
        :data-cy="button.cypressDataAttr"
      >
        <Icons :name="button.icon" />
        <span class="hidden 2xl:block">{{ button.label }}</span>
      </Button>
    </div>
    <div class="ml-auto flex items-center gap-x-2.5">
      <NotificationsPopover />

      <AppHeaderProfileButton />
    </div>
  </header>
</template>

<style>
:root {
  --app-header-height: 3.5rem;
}
</style>
