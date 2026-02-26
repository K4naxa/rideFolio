<script setup lang="ts">
import Button from "./ui/button/Button.vue";
import { useModalStore } from "@/stores/modal";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries";
import ScrollableNav from "@/components/ui/ScrollableNav.vue";
import { twMerge } from "tailwind-merge";
import VehicleAvatar from "@/components/vehicles/VehicleAvatar.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Label from "@/components/ui/label/Label.vue";
import Icon from "./icons/Icon.vue";

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
            'group cardBackground focus-visible:ring-ring/50 transition-[size, shadow] flex aspect-4/3 shrink-0 cursor-pointer flex-col overflow-hidden rounded border duration-200 outline-none hover:shadow-md focus-visible:ring-[3px] dark:bg-transparent',
            props.size === 'sm' && 'w-16',
            props.size === 'md' && 'w-42',
            props.size === 'lg' && 'h-48 lg:h-68',
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

          <div class="absolute top-1 right-1">
            <Badge v-if="vehicle.isOwnerUser" variant="accent"> <Icon name="user" /> Private</Badge>
            <Badge v-else variant="secondary"> <Icon name="users" /> {{ vehicle.pool?.name }}</Badge>
          </div>
        </div>

        <!-- text -->
        <div class="flex h-fit gap-2 p-2">
          <div class="flex flex-1 flex-col items-center justify-center truncate overflow-hidden">
            <Label class="text-foreground block w-full truncate leading-tight md:text-base lg:text-lg">
              {{ vehicle.vehicleData.name }}
            </Label>
            <span
              v-if="vehicle.vehicleData.make && vehicle.vehicleData.model"
              class="text-muted-foreground mt-auto block w-full truncate text-sm leading-tight md:text-sm lg:text-base"
            >
              {{ vehicle.vehicleData.make }} • {{ vehicle.vehicleData.model }}
            </span>
          </div>
        </div>
      </RouterLink>
    </nav>
    <div v-else class="text-muted-foreground h-fit text-center">
      <h4>No Vehicles available</h4>
      <p class="text-muted-foreground text-sm">Create your first vehicle to get started!</p>
      <Button @click="openCreateVehicleModal" class="mt-3 mb-1">Create Vehicle</Button>
    </div>
  </ScrollableNav>
</template>
