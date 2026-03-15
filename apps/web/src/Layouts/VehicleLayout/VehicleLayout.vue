<script setup lang="ts">
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { RouterView, useRoute } from "vue-router";
import { computed, useTemplateRef } from "vue";
import VehicleHero from "./components/VehicleHero.vue";
import type { IconProps } from "@/components/icons/Icon.vue";
import Icon from "@/components/icons/Icon.vue";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import MobilePageHeader from "@/Layouts/AuthLayout/components/MobilePageHeader.vue";
import { useElementBounding } from "@vueuse/core";

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

const route = useRoute();

// Derive the active tab id from the current route
const activeTab = computed(() => {
  const matched = VEHICLE_TABS.value.find((tab) => route.path === tab.to);
  return matched?.id ?? "overview";
});

const HEADER_HEIGHT = 48; // match your --app-header-height in px
const FADE_WINDOW = 60;

const vehicleHeroEl = useTemplateRef("vehicleHeroEl");
const vehicleNameEl = computed(() => vehicleHeroEl.value?.vehicleHeroNameEl ?? null);

const { top: heroNameDistanceToTop } = useElementBounding(vehicleNameEl);

const backgroundOpacity = computed(() => {
  const distanceFromHeader = heroNameDistanceToTop.value - HEADER_HEIGHT;

  if (distanceFromHeader >= FADE_WINDOW) return 0;
  if (distanceFromHeader <= 0) return 1;

  return (FADE_WINDOW - distanceFromHeader) / FADE_WINDOW;
});

const titleOpacity = computed(() => Math.min(1, Math.max((backgroundOpacity.value - 0.5) * 2)));
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col">
    <!-- Vehicle layout Hero -->
    <MobilePageHeader
      :header-style="{
        backgroundColor: `color-mix(in srgb, var(--color-background) ${backgroundOpacity * 100}%, transparent)`,
      }"
    >
      <h1 class="truncate transition-opacity duration-150" :style="{ opacity: titleOpacity }">
        {{ currentVehicle?.vehicleData.name }}
      </h1>
    </MobilePageHeader>

    <VehicleHero ref="vehicleHeroEl" class="-mt-(--app-header-height)" />

    <!-- Vehicle navigation tabs -->
    <div class="flex flex-1 flex-col">
      <nav class="sticky top-(--app-header-height) z-10 mb-0 h-(--vehicle-navbar-height) text-sm">
        <!-- Mobile nav -->
        <MainContentWrapper>
          <Tabs :model-value="activeTab" class="w-full">
            <TabsList class="w-full">
              <RouterLink
                v-for="tab in VEHICLE_TABS"
                :key="tab.id"
                :to="tab.to"
                v-slot="{ navigate }"
                draggable="false"
                custom
              >
                <TabsTrigger :value="tab.id" @click="navigate" class="flex cursor-pointer items-center gap-2">
                  <Icon v-if="tab.icon" :name="tab.icon" class="h-4 w-4" />
                  <span class="hidden lg:block">{{ tab.label }}</span>
                </TabsTrigger>
              </RouterLink>
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
