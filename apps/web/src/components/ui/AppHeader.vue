<script setup lang="ts">
import { computed } from "vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useRoute } from "vue-router";
import { useCurrentGroup } from "@/lib/composables/useCurrentGroup";
import { useIsMobile } from "@/lib/composables/useMediaQuery";

const route = useRoute();
const { currentVehicleName } = useCurrentVehicle();
const { currentGroupName } = useCurrentGroup();

const title = computed(() => {
  if (currentVehicleName.value) return `${currentVehicleName.value} ${route.name?.toString()}`;
  if (currentGroupName.value) return `${currentGroupName.value} ${route.name?.toString()}`;
  return route.name?.toString() ?? "RideFolio";
});

const isMobile = useIsMobile();
</script>

<template>
  <header
    v-if="!isMobile"
    class="bg-card sticky top-0 z-10 flex h-(--app-header-height) w-full shrink-0 items-center gap-2 border-b px-4 transition-colors ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:px-6 lg:px-8"
  >
    <div class="flex w-full items-center gap-1 overflow-hidden lg:gap-2">
      <h3 class="truncate">{{ title }}</h3>
    </div>
  </header>
</template>
