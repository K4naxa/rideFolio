<script lang="ts" setup>
import { type TAccessibleVehicle } from "@repo/validation";
import VehicleTypeIcon from "../icons/VehicleTypeIcon.vue";
import type { IconProps } from "../icons/Icon.vue";
import Icon from "../icons/Icon.vue";
interface SelectItemProps {
  vehicle: TAccessibleVehicle["vehicleData"];
  customClass?: string;
}
const props = defineProps<SelectItemProps>();
</script>
<template>
  <div :class="['flex h-14 w-full cursor-pointer items-center space-x-3 p-1 select-none', props.customClass]">
    <div class="bg-muted grid aspect-video h-full place-items-center overflow-hidden rounded-md">
      <img v-if="vehicle.image" :src="vehicle.image" :alt="'Image of ' + vehicle.name" class="object-cover" />
      <Icon
        :name="vehicle.type.icon as IconProps['name']"
        v-else-if="vehicle.type.icon"
        class="stroke-muted-foreground"
      />
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
