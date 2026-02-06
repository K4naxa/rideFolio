<script setup lang="ts">
import { ScrollArea } from "./ui/scroll-area";
import ScrollBar from "./ui/scroll-area/ScrollBar.vue";
import VehicleTypeIcon from "./icons/VehicleTypeIcon.vue";
import Button from "./ui/button/Button.vue";
import { useModalStore } from "@/stores/modal";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries";
import ScrollableNav from "@/components/ui/ScrollableNav.vue";
import { twMerge } from "tailwind-merge";
import VehicleAvatar from "@/components/vehicles/VehicleAvatar.vue";

const { data: vehicles } = useVehiclesAll();
const modalStore = useModalStore();
const openCreateVehicleModal = () => {
  modalStore.onOpen("createVehicle");
};

const props = defineProps<{
  size?: "sm" | "md" | "lg";
  class?: string;
}>();
</script>

<template>
  <ScrollableNav>
    <nav v-if="vehicles && vehicles.length > 0" class="flex gap-4 md:gap-6">
      <RouterLink
        :to="'/vehicles/' + vehicle.vehicleData.id"
        v-for="vehicle in vehicles"
        :key="vehicle.vehicleData.id"
        :class="
          twMerge(
            'group cardBackground focus-visible:ring-ring/50 transition-size flex aspect-4/3 shrink-0 cursor-pointer flex-col overflow-hidden rounded border transition-shadow duration-200 outline-none hover:shadow-md focus-visible:ring-[3px] dark:bg-transparent',
            props.size === 'sm' && 'w-16',
            props.size === 'md' && 'w-42',
            props.size === 'lg' && 'h-40 lg:h-68',
            props.class,
          )
        "
      >
        <!-- Vehicle image / type icon -->
        <div class="relative flex h-3/4 flex-col">
          <VehicleAvatar
            :src="vehicle.vehicleData.image"
            :type="vehicle.vehicleData.type.code"
            hover-effect
            class="bg-muted relative overflow-hidden rounded-b-none"
          />
          <div class="to-card dark:to-background absolute bottom-0 h-1/4 bg-linear-to-b from-transparent" />
        </div>
        <div class="flex flex-1 flex-col items-center justify-center truncate overflow-hidden p-2 text-center">
          <h3 class="text-foreground block w-full truncate leading-tight">
            {{ vehicle.vehicleData.name }}
          </h3>
          <span
            v-if="vehicle.vehicleData.make && vehicle.vehicleData.model"
            class="text-muted-foreground hidden w-full truncate md:block"
          >
            {{ vehicle.vehicleData.make }} • {{ vehicle.vehicleData.model }}
          </span>
        </div>
      </RouterLink>
    </nav>
    <div v-else class="text-muted-foreground text-center">
      <h3>No Vehicles available</h3>
      <p>Create your first vehicle to get started!</p>
      <Button @click="openCreateVehicleModal" class="mt-3">Create Vehicle</Button>
    </div>
  </ScrollableNav>
</template>
