<script lang="ts" setup>
import { VehicleTypeIcon } from "@/components/utility/icons";
import { type TAccessibleVehicle } from "@repo/validation";
interface SelectItemProps {
  vehicle: TAccessibleVehicle["vehicleData"];
  customClass?: string;
}
const props = defineProps<SelectItemProps>();
</script>
<template>
  <div
    :class="[
      'flex items-center space-x-3 w-full p-1 cursor-pointer select-none',
      props.customClass,
    ]"
  >
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-accent">
      <img
        v-if="props.vehicle.image"
        :src="props.vehicle.image"
        :alt="props.vehicle.name"
        fill
        className="object-cover"
      />

      <div v-else className="grid h-full w-full place-items-center">
        <VehicleTypeIcon :type="props.vehicle.type" className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>

    <!-- Vehicle info -->
    <div className="flex-1 min-w-0 space-y-1 text-left">
      <p className="font-medium text-sm leading-none">{{ props.vehicle.name }}</p>
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <span v-if="props.vehicle.make && props.vehicle.model" className="truncate">
          {{ props.vehicle.make }} {{ props.vehicle.model }}
        </span>

        <span v-if="props.vehicle.make && props.vehicle.model">•</span>
        <span v-if="props.vehicle.year">{{ props.vehicle.year }}</span>

        <span v-if="(props.vehicle.make && props.vehicle.model) || props.vehicle.year">•</span>
        <span className="font-mono uppercase">{{ props.vehicle.licensePlate }}</span>
      </div>
    </div>
  </div>
</template>
