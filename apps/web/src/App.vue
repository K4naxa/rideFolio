<script setup lang="ts">
import { RouterView } from "vue-router";
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import CreateVehicleModal from "./modals/createVehicleModal.vue";
import { configure } from "vee-validate";
import { useThemeStore } from "./stores/theme";
import CreateRefillModal from "./modals/createRefillModal.vue";
import NoteModal from "./modals/NoteModal.vue";
import TodoModal from "./modals/TodoModal.vue";
import AlertModal from "./modals/alertModal.vue";
import PoolModal from "./modals/PoolModal.vue";
import PoolInvitationModal from "./modals/PoolInvitationModal.vue";
import QuickLinkModal from "@/modals/QuickLinkModal.vue";
import CreateMaintenanceModal from "@/modals/Maintenance/createMaintenanceModal.vue";
import SettingsModal from "@/modals/Settings/SettingsModal.vue";

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
  <AlertModal />
  <CreateVehicleModal />
  <CreateRefillModal />
  <TodoModal />
  <NoteModal />
  <CreateMaintenanceModal />
  <PoolModal />
  <PoolInvitationModal />
  <QuickLinkModal />
  <SettingsModal />
</template>

<style scoped></style>
