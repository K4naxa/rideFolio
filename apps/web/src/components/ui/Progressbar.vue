<script setup lang="ts">
import { percent } from "motion-v";
import { h, type HTMLAttributes } from "vue";
import { Motion } from "motion-v";

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
      :animate="{ width: percent.transform(props.percent) }"
      :class="['bg-foreground/80 h-full rounded-full shadow transition-all duration-300', props.barClass]"
    />
  </div>
</template>
