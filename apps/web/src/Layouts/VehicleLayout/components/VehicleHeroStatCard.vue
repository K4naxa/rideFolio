<script setup lang="ts">
import { TrendingDownIcon, TrendingUpIcon, type LucideIcon } from "lucide-vue-next";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  isLoading?: boolean;
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
      <Suspense>
        <div class="text-sm gap-2 flex font-semibold text-foreground items-baseline">
          <template v-if="props.isLoading">
            <Skeleton class="h-3.5 w-10" />
          </template>
          <template v-else>
            <span class="leading-none">
              {{ props.value || "n/a" }}
            </span>
            <span v-if="props.suffix" class="text-muted-foreground text-xs leading-none">{{
              props.suffix
            }}</span>
          </template>
        </div>
      </Suspense>
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
