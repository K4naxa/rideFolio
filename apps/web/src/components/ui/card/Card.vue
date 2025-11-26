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
    :class="cn('cardBackground text-foreground flex flex-col gap-6 rounded border pt-6 pb-2 shadow-sm', props.class)"
  >
    <slot />
  </div>
</template>
