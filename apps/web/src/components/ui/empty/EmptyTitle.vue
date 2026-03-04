<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div data-slot="empty-title" :class="cn('text-lg leading-tight font-medium tracking-tight', props.class)">
    <slot />
  </div>
</template>
