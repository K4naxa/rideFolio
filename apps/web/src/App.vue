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
import CreateMaintenanceModal from "./modals/createMaintenanceModal.vue";
import AlertModal from "./modals/alertModal.vue";
import UserSettingsModal from "./modals/userSettingsModal.vue";
import PoolModal from "./modals/PoolModal.vue";
import PoolInvitationModal from "./modals/PoolInvitationModal.vue";

configure({});

const themeStore = useThemeStore();
</script>

<template>
  <RouterView />
  <Toaster class="pointer-events-auto" :theme="themeStore.resolvedTheme" position="top-center" :rich-colors="true" />
  <VueQueryDevtools />

  <!-- Modals -->
  <AlertModal />
  <CreateVehicleModal />
  <CreateRefillModal />
  <TodoModal />
  <NoteModal />
  <CreateMaintenanceModal />
  <UserSettingsModal />
  <PoolModal />
  <PoolInvitationModal />
</template>

<style scoped></style>
