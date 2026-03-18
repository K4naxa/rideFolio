<script setup lang="ts">
import { twMerge } from "tailwind-merge";
import { type HTMLAttributes } from "vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <h4 :class="twMerge('text-muted-foreground text-xs font-medium tracking-wide uppercase', props.class)">
    <slot />
  </h4>
</template>

<style scoped></style>
