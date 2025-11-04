<script setup lang="ts">
import { RouterView } from "vue-router";
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import CreateVehicleModal from "./modals/createVehicleModal.vue";
import { configure } from "vee-validate";
import { useThemeStore } from "./stores/theme";
import CreateRefillModal from "./modals/createRefillModal.vue";

configure({});

const themeStore = useThemeStore();
</script>

<template>
  <RouterView />
  <Toaster
    class="pointer-events-auto"
    :theme="themeStore.resolvedTheme"
    position="top-center"
    :rich-colors="true"
  />
  <VueQueryDevtools />

  <!-- Modals -->
  <CreateVehicleModal />
  <CreateRefillModal />
</template>

<style scoped></style>
