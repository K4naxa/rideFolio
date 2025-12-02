<script setup lang="ts">
import { RouterView } from "vue-router";
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import CreateVehicleModal from "./modals/createVehicleModal.vue";
import { configure } from "vee-validate";
import { useThemeStore } from "./stores/theme";
import CreateRefillModal from "./modals/createRefillModal.vue";
import CreateNoteModal from "./modals/createNoteModal.vue";
import TodoModal from "./modals/TodoModal.vue";
import CreateMaintenanceModal from "./modals/createMaintenanceModal.vue";
import AlertModal from "./modals/alertModal.vue";
import UserSettingsModal from "./modals/userSettingsModal.vue";

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
  <CreateNoteModal />
  <CreateMaintenanceModal />
  <UserSettingsModal />
</template>

<style scoped></style>
