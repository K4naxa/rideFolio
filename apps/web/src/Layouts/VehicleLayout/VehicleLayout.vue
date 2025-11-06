<script setup lang="ts">
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { RouterView } from "vue-router";
import VehicleHero from "./components/VehicleHero.vue";
import { computed } from "vue";

interface VehicleTab {
  to: string;
  label: string;
  id: string;
  icon?: unknown;
  isLoading?: boolean;
}

const { activeVehicleId } = useActiveVehicle();

const VEHICLE_TABS = computed<VehicleTab[]>(() => [
  { to: `/vehicles/${activeVehicleId.value}`, label: "Overview", id: "overview" },
  {
    to: `/vehicles/${activeVehicleId.value}/todos`,
    label: "To-dos",
    id: "todos",
  },
  {
    to: `/vehicles/${activeVehicleId.value}/notes`,
    label: "Notes",
    id: "notes",
  },
  {
    to: `/vehicles/${activeVehicleId.value}/shopping-list`,
    label: "Shopping list",
    id: "shopping-list",
  },
]);
</script>

<template>
  <div class="w-full space-y-4 lg:space-y-8">
    <!-- Vehicle layout Hero -->
    <VehicleHero />

    <!-- Vehicle navigation tabs -->
    <nav class="sticky top-14 z-20 bg-background text-sm mb-0">
      <ul class="flex border-b px-4 lg:px-8 lg:space-x-8 justify-evenly lg:justify-normal">
        <RouterLink
          v-for="tab in VEHICLE_TABS"
          :key="tab.id"
          :to="tab.to"
          exactActiveClass="text-primary border-primary"
          class="px-1 flex gap-1 lg:px-4 py-3 font-medium transition-colors duration-200 ease-in-out border-b-2 border-background text-muted-foreground hover:text-primary"
        >
          {{ tab.label }}
        </RouterLink>
      </ul>
    </nav>

    <!-- Vehicle pages -->
    <main class="w-full p-4 lg:p-8">
      <RouterView />
    </main>
  </div>
</template>
