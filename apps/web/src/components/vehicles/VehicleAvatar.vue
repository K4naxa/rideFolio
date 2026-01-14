<script setup lang="ts">
import VehicleTypeIcon from "@/components/icons/VehicleTypeIcon.vue";
import { twMerge } from "tailwind-merge";

const props = defineProps<{
  src: string | null | undefined;
  type: string | null | undefined;
  imgShadow?: boolean;
  alt?: string;
  class?: string;
}>();
</script>

<template>
  <div :class="twMerge('bg-muted group relative h-full flex-1 overflow-hidden rounded', props.class)">
    <img
      v-if="props.src"
      :src="props.src"
      loading="lazy"
      decoding="async"
      :alt="props.alt || 'Vehicle Image'"
      class="grid scale-105 object-cover object-center transition-transform duration-250 ease-in-out group-hover:scale-100"
    />
    <div v-else class="grid h-full place-items-center rounded">
      <VehicleTypeIcon
        v-if="props.type"
        :type="props.type"
        class="text-muted-foreground stroke-muted-foreground size-1/2"
      />
    </div>
    <div v-if="imgShadow" class="iconBackground absolute inset-x-0 bottom-0 h-1/4" />
  </div>
</template>
