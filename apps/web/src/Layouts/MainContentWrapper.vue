<script setup lang="ts">
import { twMerge } from "tailwind-merge";
import type { HtmlHTMLAttributes } from "vue";

const props = defineProps<{
  class?: HtmlHTMLAttributes["class"];
}>();
</script>

<template>
  <div data-slot="main-content-wrapper" class="flex h-full w-full">
    <div :class="[twMerge('mainContentPadding mx-auto flex h-full w-full max-w-370', props.class)]">
      <slot />
    </div>
  </div>
</template>
<style></style>
