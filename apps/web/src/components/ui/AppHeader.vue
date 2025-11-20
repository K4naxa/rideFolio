<script setup lang="ts">
import { computed } from "vue";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { useActivePool } from "@/lib/useActivePool";
import { useRoute } from "vue-router";
import AppHeaderProfileButton from "./AppHeaderProfileButton.vue";
import { useModalStore } from "@/stores/modal";
import { twMerge } from "tailwind-merge";
import Icons from "../icons/Icon.vue";

const route = useRoute();
const modalStore = useModalStore();
const { activeVehicleName } = useActiveVehicle();
const { activePoolName } = useActivePool();

const title = computed(() => activeVehicleName.value || activePoolName.value || route.name?.toString());

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
    class: "border-refill hover:bg-refill/10",
    cypressDataAttr: "create-refill-button",
  },
  {
    label: "Maintenance",
    icon: "maintenance",
    onClick: () => modalStore.onOpen("createMaintenance"),
    class: "border-maintenance hover:bg-maintenance/10",
    cypressDataAttr: "create-maintenance-button",
  },
  {
    label: "Note",
    icon: "notes",
    onClick: () => modalStore.onOpen("createNote"),
    class: "border-notes hover:bg-notes/20",
    cypressDataAttr: "create-note-button",
  },
  {
    label: "Todo",
    icon: "todo",
    onClick: () => modalStore.onOpen("createTodo"),
    class: "border-toDo hover:bg-toDo/20",
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
        :class="twMerge('hover:shadow-refill/50 hover:shadow-sm', button.class)"
        :data-cy="button.cypressDataAttr"
      >
        <Icons :name="button.icon" />
        <span class="hidden 2xl:block">{{ button.label }}</span>
      </Button>
    </div>
    <div class="ml-auto flex items-center gap-x-2.5">
      <Button variant="ghost" class="p-2">
        <Icons name="bell" size="sm" />
        <span class="sr-only">Notification</span>
      </Button>

      <AppHeaderProfileButton />
    </div>
  </header>
</template>

<style>
:root {
  --app-header-height: 3.5rem;
}
</style>
