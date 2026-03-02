<script setup lang="ts">
import { computed } from "vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useRoute } from "vue-router";
import { useModalStore } from "@/stores/modal";
import { useCurrentPool } from "@/lib/composables/useCurrentPool";
import { useIsMobile } from "@/lib/composables/useMediaQuery";

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
    label: "To-do",
    icon: "todo",
    onClick: () => modalStore.onOpen("createTodo"),
    class: "hover:shadow-todo/50 ",
    cypressDataAttr: "create-todo-button",
  },
]);

const isMobile = useIsMobile();
</script>

<template>
  <header
    v-if="!isMobile"
    class="bg-card transition-size sticky top-0 z-10 flex h-(--app-header-height) w-full shrink-0 items-center gap-2 border-b px-4 ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:px-6 lg:px-8"
  >
    <div class="flex w-full items-center gap-1 overflow-hidden lg:gap-2">
      <h3 class="truncate">{{ title }}</h3>
    </div>
  </header>
</template>

<style>
:root {
  --app-header-height: 3rem;
}
</style>
