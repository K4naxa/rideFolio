<script setup lang="ts">
import VehicleTypeIcon from "@/components/icons/VehicleTypeIcon.vue";
import { twMerge } from "tailwind-merge";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  src: string | null | undefined;
  type: string | null | undefined;
  imgShadow?: boolean;
  alt?: string;
  class?: HTMLAttributes["class"];
  hoverEffect?: boolean;
}>();
</script>

<template>
  <div :class="twMerge('bg-muted group relative h-full w-full overflow-hidden rounded', props.class)">
    <img
      v-if="props.src"
      :src="props.src"
      loading="lazy"
      decoding="async"
      :alt="props.alt || 'Vehicle Image'"
      :class="
        twMerge(
          'h-full w-full object-cover object-center',
          props.hoverEffect ? 'scale-100 transition-transform duration-500 group-hover:scale-105' : '',
        )
      "
    />
    <div v-else class="grid h-full place-items-center rounded">
      <VehicleTypeIcon
        v-if="props.type"
        :type="props.type"
        class="text-muted-foreground stroke-muted-foreground size-1/2"
      />
    </div>
    <div v-if="props.imgShadow" class="iconBackground absolute inset-x-0 bottom-0 h-1/4" />
  </div>
</template>
