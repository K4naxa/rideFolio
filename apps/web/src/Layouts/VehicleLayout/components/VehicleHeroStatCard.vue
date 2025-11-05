<script setup lang="ts">
import { TrendingDownIcon, TrendingUpIcon, type LucideIcon } from "lucide-vue-next";

interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
}
const props = defineProps<StatCardProps>();

const TrendIcon =
  props.trend === "up" ? TrendingUpIcon : props.trend === "down" ? TrendingDownIcon : null;
</script>

<template>
  <div
    class="relative flex flex-col items-center gap-1.5 rounded border cardBackground p-2.5 text-center"
  >
    <props.icon class="stroke-primary" />
    <div class="flex items-center gap-1">
      <div class="text-sm gap-2 flex font-semibold text-foreground items-baseline">
        <span class="leading-none">
          {{ props.value || "n/a" }}
        </span>
        <span v-if="props.suffix" class="text-muted-foreground text-xs leading-none">{{
          props.suffix
        }}</span>
      </div>
      <TrendIcon
        v-if="TrendIcon"
        :class="[
          'size-3 top-2 right-2 absolute',
          trend === 'up' ? 'stroke-success' : 'stroke-destructive',
        ]"
      />
    </div>
    <span class="text-xs leading-tight text-muted-foreground">{{ label }}</span>
  </div>
</template>
