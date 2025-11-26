<script setup lang="ts">
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { RouterView } from "vue-router";
import { computed } from "vue";
import VehicleHero from "./components/VehicleHero.vue";

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
  <div class="flex min-w-0 flex-1 flex-col">
    <!-- Vehicle layout Hero -->
    <div class="my-4 lg:my-6">
      <VehicleHero />
    </div>

    <!-- Vehicle navigation tabs -->

    <div class="flex flex-1 flex-col">
      <nav class="bg-background sticky top-(--app-header-height) z-20 mb-0 h-(--vehicle-navbar-height) text-sm">
        <ul class="flex h-full justify-evenly border-b px-4 lg:justify-normal lg:space-x-8 lg:px-8">
          <RouterLink
            v-for="tab in VEHICLE_TABS"
            :key="tab.id"
            :to="tab.to"
            exactActiveClass="text-primary border-primary"
            class="border-background text-muted-foreground hover:text-primary flex gap-1 border-b-2 px-1 py-3 font-medium select-none lg:px-4"
            draggable="false"
          >
            {{ tab.label }}
          </RouterLink>
        </ul>
      </nav>

      <!-- Vehicle pages -->
      <main class="flex flex-1 flex-col p-4 lg:p-8">
        <!-- Vehicle RouterView -->
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
:root {
  --vehicle-navbar-height: 3rem; /* Adjust this value to match your nav height */
}
</style>
