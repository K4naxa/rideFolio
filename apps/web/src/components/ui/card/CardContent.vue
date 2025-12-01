<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { twMerge } from "tailwind-merge";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div data-slot="card-content" :class="twMerge('px-4 lg:px-6', props.class)">
    <slot />
  </div>
</template>
