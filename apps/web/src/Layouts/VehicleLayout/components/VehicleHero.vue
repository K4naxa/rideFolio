<script setup lang="ts">
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import { Icons, VehicleTypeIcon } from "@/components/utility/icons";
import { api } from "@/lib/api";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { type TStatCardData } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";
import {
  ChevronDownIcon,
  DollarSignIcon,
  EditIcon,
  GaugeIcon,
  MoreVerticalIcon,
  RouteIcon,
} from "lucide-vue-next";
import { computed, ref } from "vue";
import VehicleHeroStatCard from "./VehicleHeroStatCard.vue";

const { activeVehicle } = useActiveVehicle();
const { data: statCardData } = useQuery({
  queryFn: async () => {
    if (!activeVehicle.value?.vehicleData.id) {
      throw new Error("No active vehicle");
    }
    return (
      await api.get<TStatCardData>(`/vehicles/${activeVehicle.value.vehicleData.id}/stat-card`)
    ).data;
  },
  queryKey: computed(() => [activeVehicle.value?.vehicleData.id, "stat-card"]),
  enabled: computed(() => !!activeVehicle.value?.vehicleData.id),
});

const statsOpen = ref(false);
</script>

<template>
  <div class="w-full px-4 lg:px-8 flex flex-col gap-4 lg:flex-row">
    <!-- Vehicle image & placeholder -->
    <div class="h-fit flex justify-center w-full lg:w-auto lg:h-52 shrink-0">
      <img
        v-if="activeVehicle?.vehicleData.image"
        :src="activeVehicle.vehicleData.image"
        class="h-full w-full object-cover rounded lg:w-auto"
      />
      <div
        v-else
        class="h-full rounded w-full bg-muted/40 border grid place-items-center lg:aspect-video lg:w-auto"
      >
        <VehicleTypeIcon
          :type="activeVehicle?.vehicleData.type || 'other'"
          className="size-16 stroke-muted-foreground rounded"
        />
      </div>
    </div>

    <div>
      <!-- Info section -->

      <div
        class="flex flex-1 w-full lg:flex-col gap-3 lg:px-6 justify-between lg:justify-normal lg:gap-6"
      >
        <div class="space-y-1 lg:pr-10">
          <h1 class="text-balance text-2xl sm:text-3xl font-bold leading-tight text-foreground">
            {{ activeVehicle?.vehicleData.name }}
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ activeVehicle?.vehicleData.make && `${activeVehicle?.vehicleData.make} •` }}
            {{ activeVehicle?.vehicleData.model && `${activeVehicle?.vehicleData.model} •` }}
            {{ activeVehicle?.vehicleData.year }}
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <div class="hidden lg:flex flex-wrap items-center gap-2 text-sm">
            <Badge
              v-if="activeVehicle?.vehicleData.licensePlate"
              variant="outline"
              class="px-2.5 py-1 text-xs font-medium rounded-full border"
            >
              {{ activeVehicle?.vehicleData.licensePlate }}
            </Badge>

            <Badge
              variant="outline"
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground"
            >
              <GaugeIcon class="size-3.5" />
              {{ activeVehicle?.vehicleData.odometerData.value }}
              {{ activeVehicle?.vehicleData.odometerData.unit || "N/A" }}
            </Badge>
          </div>
          <Badge
            v-if="activeVehicle?.vehicleData.vin"
            variant="outline"
            class="px-2.5 py-1 text-xs font-medium rounded-full hidden lg:block"
          >
            VIN: {{ activeVehicle.vehicleData.vin }}
          </Badge>
        </div>

        <div class="lg:hidden flex items-center">
          <DropdownMenu :modal="false">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="vehicle Actions">
                <MoreVerticalIcon class="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem aria-label="Edit Vehicle">
                <EditIcon />
                Edit
              </DropdownMenuItem>
              <Separator class="my-1" />
              <DropdownMenuItem
                variant="destructive"
                aria-label="Delete Vehicle"
                class="text-destructive"
              >
                <Icons.trash />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" @click="statsOpen = !statsOpen" class="">
            <ChevronDownIcon
              :class="[
                'transition-transform duration-200 ease-in-out ',
                { 'rotate-180': statsOpen },
              ]"
            />
          </Button>
        </div>
      </div>

      <!-- Mobile Details Panel - Contains both badges and stat cards -->
      <Transition name="slide-expand">
        <div v-if="statsOpen" class="lg:hidden w-full stats-panel overflow-hidden pb-4">
          <div class="stats-content space-y-4">
            <Separator class="my-4" />
            <!-- Vehicle Info Badges -->
            <div class="space-y-3">
              <div class="flex flex-wrap gap-2">
                <Badge
                  v-if="activeVehicle?.vehicleData.licensePlate"
                  variant="outline"
                  class="px-2.5 py-1 text-xs font-medium rounded-full border"
                >
                  {{ activeVehicle?.vehicleData.licensePlate }}
                </Badge>

                <Badge
                  variant="outline"
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground"
                >
                  <GaugeIcon class="size-3.5" />
                  {{ activeVehicle?.vehicleData.odometerData.value }}
                  {{ activeVehicle?.vehicleData.odometerData.unit || "N/A" }}
                </Badge>

                <Badge
                  v-if="activeVehicle?.vehicleData.vin"
                  variant="outline"
                  class="px-2.5 py-1 text-xs font-medium rounded-full"
                >
                  VIN: {{ activeVehicle.vehicleData.vin }}
                </Badge>
              </div>
            </div>

            <!-- Statistics Cards -->
            <div class="space-y-3">
              <div class="grid grid-cols-1 gap-3">
                <VehicleHeroStatCard
                  :icon="GaugeIcon"
                  label="Avg. Consumption"
                  :value="`${statCardData?.monthlyAverageConsumption.value} `"
                  :suffix="`${statCardData?.monthlyAverageConsumption.unit}`"
                  :trend="statCardData?.monthlyAverageConsumption.trend"
                />
                <div class="grid grid-cols-2 gap-3">
                  <VehicleHeroStatCard
                    :icon="DollarSignIcon"
                    label="Montly Cost"
                    :value="`${statCardData?.monthlyRunningCost.value}`"
                  />
                  <VehicleHeroStatCard
                    :icon="RouteIcon"
                    label="Total Distance"
                    :value="`${statCardData?.trackedUnits.value.toLocaleString()}`"
                    :suffix="`${statCardData?.trackedUnits.unit}`"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Statistics section -->
    <div
      class="hidden ml-auto lg:flex w-full flex-col gap-3 border-t px-6 max-w-lg lg:border-l lg:border-t-0 min-w-96"
    >
      <div class="lg:flex justify-end hidden">
        <DropdownMenu :modal="false">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="vehicle Actions">
              <MoreVerticalIcon class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem aria-label="Edit Vehicle">
              <EditIcon />
              Edit
            </DropdownMenuItem>
            <Separator class="my-1" />
            <DropdownMenuItem
              variant="destructive"
              aria-label="Delete Vehicle"
              class="text-destructive"
            >
              <Icons.trash />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div class="grid flex-1 grid-cols-3 gap-2 content-end">
        <VehicleHeroStatCard
          :icon="GaugeIcon"
          label="Avg. Consumption"
          :value="`${statCardData?.monthlyAverageConsumption.value} `"
          :suffix="`${statCardData?.monthlyAverageConsumption.unit}`"
          :trend="statCardData?.monthlyAverageConsumption.trend"
        />
        <VehicleHeroStatCard
          :icon="DollarSignIcon"
          label="Montly Cost"
          :value="`${statCardData?.monthlyRunningCost.value}`"
        />
        <VehicleHeroStatCard
          :icon="RouteIcon"
          label="Total Distance"
          :value="`${statCardData?.trackedUnits.value.toLocaleString()}`"
          :suffix="`${statCardData?.trackedUnits.unit}`"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Smooth slide-expand transition for mobile stats panel */
.slide-expand-enter-active {
  transition:
    grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-expand-leave-active {
  transition:
    grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.6, 1),
    opacity 0.25s cubic-bezier(0.4, 0, 0.6, 1);
}

.slide-expand-enter-from {
  opacity: 0;
  display: grid;
  grid-template-rows: 0fr;
}

.slide-expand-enter-to {
  opacity: 1;
  display: grid;
  grid-template-rows: 1fr;
}

.slide-expand-leave-from {
  opacity: 1;
  display: grid;
  grid-template-rows: 1fr;
}

.slide-expand-leave-to {
  opacity: 0;
  display: grid;
  grid-template-rows: 0fr;
}

/* Ensure smooth performance and proper overflow handling */
.stats-panel {
  will-change: grid-template-rows, opacity;
  backface-visibility: hidden;
}

.stats-content {
  overflow: hidden;
}
</style>
