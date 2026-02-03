<script setup lang="ts">
import { twMerge } from "tailwind-merge";
import type { HtmlHTMLAttributes } from "vue";

const props = defineProps<{
  class?: HtmlHTMLAttributes["class"];
}>();
</script>

<template>
  <div data-slot="main-content-wrapper" class="flex w-full">
    <div :class="[twMerge('mx-auto flex w-full max-w-370 px-4 sm:px-6 lg:px-8', props.class)]">
      <slot />
    </div>
  </div>
</template>
