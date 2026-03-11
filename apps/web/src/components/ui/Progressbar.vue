<script setup lang="ts">
import { Motion, percent as motionPercent } from "motion-v";
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
      :initial="{ width: 0 }"
      :animate="{ width: motionPercent.transform(props.percent) }"
      :class="['bg-accent h-full rounded-full shadow transition-all duration-300', props.barClass]"
    />
  </div>
</template>
