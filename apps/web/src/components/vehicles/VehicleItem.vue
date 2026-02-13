<script setup lang="ts">
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import VehicleAvatar from "@/components/vehicles/VehicleAvatar.vue";
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
</script>

<template>
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
