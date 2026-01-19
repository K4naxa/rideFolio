<script lang="ts" setup>
import { type TAccessibleVehicle } from "@repo/validation";
import VehicleAvatar from "@/components/vehicles/VehicleAvatar.vue";
import Icon from "@/components/icons/Icon.vue";
interface SelectItemProps {
  vehicle: TAccessibleVehicle["vehicleData"];
  customClass?: string;
  isActive?: boolean;
}
const props = defineProps<SelectItemProps>();
</script>
<template>
  <div :class="['flex h-14 w-full cursor-pointer items-center space-x-3 select-none', props.customClass]">
    <div class="bg-muted grid aspect-video h-full place-items-center overflow-hidden rounded-md">
      <VehicleAvatar :src="props.vehicle.image" :type="props.vehicle.type.code" />
    </div>

    <!-- Vehicle info -->
    <div class="min-w-0 flex-1 space-y-1 text-left">
      <p class="text-sm leading-none font-medium">{{ props.vehicle.name }}</p>
      <div class="text-muted-foreground flex items-center space-x-2 text-xs">
        <span v-if="props.vehicle.make && props.vehicle.model" class="truncate">
          {{ props.vehicle.make }} {{ props.vehicle.model }}
        </span>

        <span v-if="props.vehicle.make && props.vehicle.model">•</span>
        <span v-if="props.vehicle.year">{{ props.vehicle.year }}</span>

        <span v-if="(props.vehicle.make && props.vehicle.model) || props.vehicle.year">•</span>
        <span class="font-mono uppercase">{{ props.vehicle.licensePlate }}</span>
      </div>
    </div>
    <div>
      <Icon name="check" v-if="props.isActive" class="stroke-primary mr-2 ml-auto h-5 w-5" />
    </div>
  </div>
</template>
