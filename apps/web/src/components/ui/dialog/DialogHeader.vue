<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import Separator from "@/components/ui/separator/Separator.vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div class="">
    <div data-slot="dialog-header" :class="cn('relative flex flex-col gap-0 text-center sm:text-left', props.class)">
      <slot />
    </div>
  </div>
</template>
