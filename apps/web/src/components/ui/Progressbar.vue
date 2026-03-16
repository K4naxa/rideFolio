<script setup lang="ts">
import { Motion } from "motion-v";
import { type HTMLAttributes } from "vue";

const props = defineProps<{
  percent: number;
  bgClass?: HTMLAttributes["class"];
  barClass?: HTMLAttributes["class"];
}>();
</script>
<template>
  <div class="bg-muted h-2 w-full overflow-hidden rounded-full">
    <Motion
      tag="div"
      :initial="{ scaleX: 0 }"
      :animate="{
        scaleX: Math.max(0, Math.min(props.percent, 100)) / 100,
        transition: {
          duration: 0.3,
        },
      }"
      :class="['bg-accent h-full origin-left rounded-full shadow', props.barClass]"
    />
  </div>
</template>
