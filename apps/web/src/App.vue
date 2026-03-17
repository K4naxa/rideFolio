<script setup lang="ts">
import { RouterView } from "vue-router";
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import VehicleFormModal from "./modals/VehicleFormModal.vue";
import { configure } from "vee-validate";
import { useThemeStore } from "./stores/theme";
import RefillModal from "./modals/RefillModal.vue";
import NoteModal from "./modals/NoteModal.vue";
import TodoModal from "./modals/TodoModal.vue";
import GroupModal from "./modals/GroupModal.vue";
import QuickLinkModal from "@/modals/QuickLinkModal.vue";
import CreateMaintenanceModal from "@/modals/Maintenance/createMaintenanceModal.vue";
import SettingsModal from "@/modals/Settings/SettingsModal.vue";
import ShoppingItemModal from "@/modals/ShoppingItemModal.vue";
import VehicleDetailsDialog from "@/modals/VehicleDetailsDialog.vue";
import RefillDetailsDialog from "@/modals/RefillDetailsDialog.vue";
import MaintenanceDetailsDialog from "@/modals/MaintenanceDetailsDialog.vue";
import TodoDetailsDialog from "@/modals/TodoDetailsDialog.vue";

configure({});

const themeStore = useThemeStore();
</script>

<template>
  <RouterView />
  <Toaster
    class="pointer-events-auto"
    :theme="themeStore.resolvedTheme"
    position="top-center"
    :toastOptions="{
      classes: {
        error: 'border-destructive text-destructive [&>svg]:text-destructive',
        success: 'border-green-500 text-green-500 [&>svg]:text-green-500',
        warning: 'border-yellow-500 text-yellow-500 [&>svg]:text-yellow-500',
      },
    }"
  />
  <VueQueryDevtools />

  <!-- Modals -->
  <VehicleFormModal />
  <RefillModal />
  <TodoModal />
  <NoteModal />
  <CreateMaintenanceModal />
  <GroupModal />
  <QuickLinkModal />
  <SettingsModal />
  <ShoppingItemModal />
  <VehicleDetailsDialog />
  <RefillDetailsDialog />
  <MaintenanceDetailsDialog />
  <TodoDetailsDialog />
</template>
