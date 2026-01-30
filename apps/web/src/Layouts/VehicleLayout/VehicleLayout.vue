<script setup lang="ts">
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { RouterView } from "vue-router";
import { computed } from "vue";
import VehicleHero from "./components/VehicleHero.vue";
import type { IconProps } from "@/components/icons/Icon.vue";
import Icon from "@/components/icons/Icon.vue";
import ScrollableNav from "@/components/ui/ScrollableNav.vue";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VehicleTab {
  to: string;
  label: string;
  id: string;
  icon?: IconProps["name"];
  isLoading?: boolean;
}

const { currentVehicleId } = useCurrentVehicle();

const VEHICLE_TABS = computed<VehicleTab[]>(() => [
  { to: `/vehicles/${currentVehicleId.value}`, icon: "overview", label: "Overview", id: "overview" },
  {
    to: `/vehicles/${currentVehicleId.value}/todos`,
    icon: "todo",
    label: "To-dos",
    id: "todos",
  },
  {
    to: `/vehicles/${currentVehicleId.value}/notes`,
    icon: "notes",
    label: "Notes",
    id: "notes",
  },
  {
    to: `/vehicles/${currentVehicleId.value}/shopping-list`,
    icon: "shoppingCart",
    label: "Shopping list",
    id: "shopping-list",
  },
  {
    to: `/vehicles/${currentVehicleId.value}/timelapse`,
    icon: "distance",
    label: "Timelapse",
    id: "timelapse",
  },
]);
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col">
    <!-- Vehicle layout Hero -->
    <div class="lg:my-6">
      <VehicleHero />
    </div>

    <!-- Vehicle navigation tabs -->
    <div class="flex flex-1 flex-col">
      <nav
        class="bg-background sticky top-(--app-header-height) z-20 mb-0 h-(--vehicle-navbar-height) border-b pt-1 text-sm"
      >
        <!-- Mobile nav -->
        <Tabs class="mx-1 lg:mx-8">
          <TabsList class="bg-background w-full">
            <TabsTrigger v-for="tab in VEHICLE_TABS" :key="tab.id" :value="tab.id" as-child>
              <RouterLink
                :to="tab.to"
                exact-active-class="text-accent-foreground! bg-accent!"
                class="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 px-3 py-2 font-medium select-none"
                draggable="false"
              >
                <Icon v-if="tab.icon" :name="tab.icon" class="h-4 w-4" />
                <span class="hidden lg:block">{{ tab.label }}</span>
              </RouterLink>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </nav>

      <!-- Vehicle pages -->
      <main class="flex flex-1 flex-col p-2 pt-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
:root {
  --vehicle-navbar-height: 3.5rem;
}
</style>
