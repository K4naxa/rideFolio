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
        'cardBackground text-foreground flex flex-col gap-4 rounded border py-5 shadow-sm lg:gap-6 lg:py-6',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
