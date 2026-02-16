<script setup lang="ts">
import Badge from "@/components/ui/badge/Badge.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import VehicleAvatar from "@/components/vehicles/VehicleAvatar.vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import type { BasicVehicle } from "@repo/validation";
import { twMerge } from "tailwind-merge";

const props = withDefaults(
  defineProps<{
    vehicle?: BasicVehicle | null | undefined;
    variant?: "default" | "small";
  }>(),
  {
    variant: "default",
  },
);

const isMobile = useIsMobile();
</script>

<template>
  <template v-if="isMobile">
    <div v-if="!props.vehicle" class="flex items-center gap-4">
      <Skeleton :class="twMerge('aspect-video h-16 w-fit shrink-0 rounded-md', props.variant === 'small' && 'h-12')" />
      <div>
        <Skeleton class="mb-2 h-4 w-32 rounded-md" />
        <Skeleton class="h-3 w-48 rounded-md" />
      </div>
    </div>

    <div v-else class="flex w-full items-center gap-4">
      <VehicleAvatar
        :src="props.vehicle?.image"
        :type="props.vehicle?.type.code"
        :class="twMerge('aspect-video h-16 w-fit shrink-0', props.variant === 'small' && 'h-14')"
      />
      <div class="">
        <h3
          :class="
            twMerge('truncate text-start text-lg leading-tight font-medium', props.variant === 'small' && 'text-sm')
          "
        >
          {{ props.vehicle?.name }}
        </h3>
        <div :class="twMerge('text-muted-foreground flex', props.variant === 'small' && 'text-xs')">
          <span v-if="props.vehicle?.make" class="truncate"> {{ props.vehicle?.make }} </span>
          <span v-if="props.vehicle?.model" class="beforeDot">
            {{ props.vehicle?.model }}
          </span>
          <span v-if="props.vehicle?.year" class="beforeDot">
            {{ props.vehicle?.year }}
          </span>
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="flex items-center gap-3">
      <VehicleAvatar
        :src="props.vehicle?.image"
        :type="props.vehicle?.type.code"
        :vehicle="props.vehicle"
        class="aspect-video h-14 w-fit"
      />
      <div>
        <div class="flex">
          <h3 class="">
            {{ props.vehicle?.name }}
          </h3>
        </div>
        <div class="flex gap-4">
          <p
            v-if="props.vehicle?.make || props.vehicle?.model"
            :class="twMerge('flex items-center', props.variant === 'small' && 'text-sm')"
          >
            {{ props.vehicle?.make }}
            {{ props.vehicle?.model }}
          </p>
          <span v-if="props.vehicle?.year" class="text-muted-foreground flex items-center gap-2 text-base">
            Year:
            <Badge class="bg-muted text-foreground rounded-md font-normal">
              {{ props.vehicle?.year }}
            </Badge>
          </span>

          <span
            v-if="props.vehicle?.licensePlate && props.variant !== 'small'"
            class="text-muted-foreground flex items-center gap-2 text-base"
          >
            License:
            <Badge class="bg-muted text-foreground h-fit rounded-md font-normal">
              {{ props.vehicle?.licensePlate }}
            </Badge>
          </span>

          <span
            v-if="props.vehicle?.odometerData?.value && props.variant !== 'small'"
            class="text-muted-foreground flex items-center gap-1 text-base"
          >
            Odometer:
            <Badge class="bg-muted text-foreground h-fit rounded-md font-normal">
              {{ props.vehicle?.odometerData.value }} {{ props.vehicle?.odometerData.unit }}
            </Badge>
          </span>
          <span
            v-if="props.vehicle?.odometerData?.lifeTimeTracked && props.variant !== 'small'"
            class="text-muted-foreground flex items-center gap-1 text-base"
          >
            Tracked distance:
            <Badge class="bg-muted text-foreground h-fit rounded-md font-normal">
              {{ props.vehicle?.odometerData.lifeTimeTracked }} {{ props.vehicle?.odometerData.unit }}
            </Badge>
          </span>
        </div>
      </div>
    </div>
  </template>
</template>
