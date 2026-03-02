<script setup lang="ts">
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { RouterView } from "vue-router";
import { computed } from "vue";
import VehicleHero from "./components/VehicleHero.vue";
import type { IconProps } from "@/components/icons/Icon.vue";
import Icon from "@/components/icons/Icon.vue";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import MobilePageHeader from "@/Layouts/AuthLayout/components/MobilePageHeader.vue";

interface VehicleTab {
  to: string;
  label: string;
  id: string;
  icon?: IconProps["name"];
  isLoading?: boolean;
}

const { currentVehicleId, currentVehicle } = useCurrentVehicle();

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
]);
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col">
    <!-- Vehicle layout Hero -->
    <MobilePageHeader>
      <h1>{{ currentVehicle?.vehicleData.name }}</h1>
    </MobilePageHeader>

    <VehicleHero class="" />

    <!-- Vehicle navigation tabs -->
    <div class="flex flex-1 flex-col">
      <nav class="bg-background sticky top-(--app-header-height) z-20 mb-0 h-(--vehicle-navbar-height) text-sm">
        <!-- Mobile nav -->
        <MainContentWrapper class="px-1">
          <Tabs class="w-full">
            <TabsList class="bg-muted/50 w-full">
              <TabsTrigger v-for="tab in VEHICLE_TABS" :key="tab.id" :value="tab.id" as-child>
                <RouterLink
                  :to="tab.to"
                  exact-active-class="text-accent-foreground! bg-background!"
                  class="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 px-3 py-2 font-medium select-none"
                  draggable="false"
                >
                  <Icon v-if="tab.icon" :name="tab.icon" class="h-4 w-4" />
                  <span class="hidden lg:block">{{ tab.label }}</span>
                </RouterLink>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </MainContentWrapper>
      </nav>

      <!-- Vehicle pages -->
      <main class="mt-8 flex flex-1 flex-col pb-4">
        <MainContentWrapper>
          <RouterView />
        </MainContentWrapper>
      </main>
    </div>
  </div>
</template>

<style>
:root {
  --vehicle-navbar-height: 3rem;
}
</style>
