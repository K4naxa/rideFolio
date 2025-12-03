<script setup lang="ts">
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import NumberFlow from "@number-flow/vue";

import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";

import { ChevronDownIcon, DollarSignIcon, EditIcon, GaugeIcon, MoreVerticalIcon, RouteIcon } from "lucide-vue-next";
import { ref } from "vue";
import VehicleHeroStatCard from "./VehicleHeroStatCard.vue";
import Icon from "@/components/icons/Icon.vue";
import { useModalStore } from "@/stores/modal";
import type { AlertModalData } from "@/modals/alertModal.vue";
import { useRouter } from "vue-router";
import VehicleTypeIcon from "@/components/icons/VehicleTypeIcon.vue";
import { useVehicleHeroStatCards } from "@/lib/queries/vehicles/vehicle-queries";
import { useVehicleDelete } from "@/lib/queries/vehicles/vehicle-mutations";

const router = useRouter();
const modalStore = useModalStore();
const { mutateAsync: deleteVehicle } = useVehicleDelete();
const { currentVehicle, currentVehicleId } = useCurrentVehicle();
const { data: statCardData, isLoading } = useVehicleHeroStatCards(currentVehicleId);

function handleDeleteClick() {
  modalStore.onOpen("alert", {
    title: "Delete Vehicle",
    description: currentVehicle.value?.vehicleData.name
      ? `Are you sure you want to delete <b>${currentVehicle.value.vehicleData.name}</b>? <br/> This action cannot be undone.`
      : "Are you sure you want to delete this vehicle? This action cannot be undone.",
    actionButton: {
      label: "Delete",
      class: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    },
    cancelButton: {
      label: "Cancel",
    },
    onAction: async () => {
      console.log("Deleting vehicle...");
      if (!currentVehicleId.value) return;
      await deleteVehicle(currentVehicleId.value);
      router.push("/dashboard");
    },
  } as AlertModalData);
}

const statsOpen = ref(false);
</script>

<template>
  <div class="flex w-full flex-col gap-4 px-4 lg:flex-row lg:px-8" data-cy="vehicle-hero">
    <!-- Vehicle image & placeholder -->
    <div class="flex h-52 w-full shrink-0 justify-center lg:aspect-video lg:w-auto">
      <img
        v-if="currentVehicle?.vehicleData.image"
        :src="currentVehicle.vehicleData.image"
        class="h-full w-full rounded object-cover"
      />
      <div v-else class="bg-muted/40 grid h-full w-full place-items-center rounded border">
        <VehicleTypeIcon
          v-if="currentVehicle && currentVehicle.vehicleData.type.code"
          :type="currentVehicle?.vehicleData.type.code"
          class="stroke-muted-foreground size-16 rounded"
        />
      </div>
    </div>

    <div>
      <!-- Info section -->

      <div class="flex w-full flex-1 justify-between gap-3 lg:flex-col lg:justify-normal lg:gap-6 lg:px-6">
        <div class="space-y-1 lg:pr-10">
          <h1 class="text-foreground text-2xl leading-tight font-bold text-balance sm:text-3xl">
            {{ currentVehicle?.vehicleData.name }}
          </h1>
          <p class="text-muted-foreground text-sm">
            {{ currentVehicle?.vehicleData.make && `${currentVehicle?.vehicleData.make} •` }}
            {{ currentVehicle?.vehicleData.model && `${currentVehicle?.vehicleData.model} •` }}
            {{ currentVehicle?.vehicleData.year }}
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <div class="hidden flex-wrap items-center gap-2 text-sm lg:flex">
            <Badge
              v-if="currentVehicle?.vehicleData.licensePlate"
              variant="outline"
              class="rounded-full border px-2.5 py-1 text-xs font-medium"
            >
              {{ currentVehicle?.vehicleData.licensePlate }}
            </Badge>

            <Badge
              variant="outline"
              class="text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
            >
              <GaugeIcon class="size-3.5" />
              <NumberFlow :value="currentVehicle?.vehicleData.odometerData.value || 0" :animated="true" />
              {{ currentVehicle?.vehicleData.odometerData.unit || "N/A" }}
            </Badge>
          </div>
          <Badge
            v-if="currentVehicle?.vehicleData.vin"
            variant="outline"
            class="hidden rounded-full px-2.5 py-1 text-xs font-medium lg:block"
          >
            VIN: {{ currentVehicle.vehicleData.vin }}
          </Badge>
        </div>

        <div class="flex items-center lg:hidden">
          <DropdownMenu :modal="false">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="vehicle Actions" data-cy="actions-trigger">
                <MoreVerticalIcon class="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem aria-label="Edit Vehicle" data-cy="edit-vehicle-btn">
                <EditIcon />
                Edit
              </DropdownMenuItem>
              <Separator class="my-1" />
              <DropdownMenuItem
                variant="destructive"
                @click="handleDeleteClick"
                aria-label="Delete Vehicle"
                class="text-destructive"
                data-cy="delete-vehicle-btn"
              >
                <Icon name="trash" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" @click="statsOpen = !statsOpen" class="">
            <ChevronDownIcon :class="['transition-transform duration-200 ease-in-out', { 'rotate-180': statsOpen }]" />
          </Button>
        </div>
      </div>

      <!-- Mobile Details Panel - Contains both badges and stat cards -->
      <Transition name="slide-expand">
        <div v-if="statsOpen" class="stats-panel w-full overflow-hidden pb-4 lg:hidden">
          <div class="stats-content space-y-4">
            <Separator class="my-4" />
            <!-- Vehicle Info Badges -->
            <div class="space-y-3">
              <div class="flex flex-wrap gap-2">
                <Badge
                  v-if="currentVehicle?.vehicleData.licensePlate"
                  variant="outline"
                  class="rounded-full border px-2.5 py-1 text-xs font-medium"
                >
                  {{ currentVehicle?.vehicleData.licensePlate }}
                </Badge>

                <Badge
                  variant="outline"
                  class="text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                >
                  <GaugeIcon class="size-3.5" />
                  {{ currentVehicle?.vehicleData.odometerData.value }}
                  {{ currentVehicle?.vehicleData.odometerData.unit || "N/A" }}
                </Badge>

                <Badge
                  v-if="currentVehicle?.vehicleData.vin"
                  variant="outline"
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                >
                  VIN: {{ currentVehicle.vehicleData.vin }}
                </Badge>
              </div>
            </div>

            <!-- Statistics Cards -->
            <div class="space-y-3">
              <div class="grid grid-cols-1 gap-3">
                <VehicleHeroStatCard
                  :icon="GaugeIcon"
                  label="Avg. Consumption"
                  :value="`${statCardData?.averageConsumption.value} `"
                  :suffix="`${statCardData?.averageConsumption.unit}`"
                  :is-loading="isLoading"
                />
                <div class="grid grid-cols-2 gap-3">
                  <VehicleHeroStatCard
                    :icon="DollarSignIcon"
                    label="Montly Cost"
                    :value="`${statCardData?.monthlyRunningCost}`"
                    :is-loading="isLoading"
                  />
                  <VehicleHeroStatCard
                    :icon="RouteIcon"
                    label="Total Distance"
                    :value="`${Number(statCardData?.trackedUnits.value).toLocaleString()}`"
                    :suffix="`${statCardData?.trackedUnits.unit}`"
                    :is-loading="isLoading"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Statistics section -->
    <div class="ml-auto hidden w-full max-w-lg min-w-32 flex-col gap-3 border-t px-6 lg:flex lg:border-t-0 lg:border-l">
      <div class="hidden justify-end lg:flex">
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
              @click="handleDeleteClick"
              aria-label="Delete Vehicle"
              class="text-destructive"
              data-cy="delete-vehicle-btn"
            >
              <Icon name="trash" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div class="flex flex-1 grid-cols-3 flex-wrap content-end justify-evenly gap-4 2xl:grid">
        <VehicleHeroStatCard
          :icon="GaugeIcon"
          label="Avg. Consumption"
          :value="`${statCardData?.averageConsumption.value} `"
          :suffix="`${statCardData?.averageConsumption.unit}`"
          :is-loading="isLoading"
        />
        <VehicleHeroStatCard
          :icon="DollarSignIcon"
          label="Montly Cost"
          :value="`${statCardData?.monthlyRunningCost}`"
          :is-loading="isLoading"
        />
        <VehicleHeroStatCard
          :icon="RouteIcon"
          label="Total Distance"
          :value="`${String(statCardData?.trackedUnits.value).toLocaleString()}`"
          :suffix="`${statCardData?.trackedUnits.unit}`"
          :is-loading="isLoading"
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
