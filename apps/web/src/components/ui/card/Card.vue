<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'cardBackground text-foreground flex flex-col gap-4 rounded border pt-5 pb-3 shadow-sm lg:gap-6 lg:pt-6',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
