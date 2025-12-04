<script setup lang="ts">
import { TrendingDownIcon, TrendingUpIcon, type LucideIcon } from "lucide-vue-next";
import NumberFlow from "@number-flow/vue";

import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  trend?: "up" | "down";
  iconSymbol?: string;
  icon?: LucideIcon;
  isLoading?: boolean;
}
const props = defineProps<StatCardProps>();

const TrendIcon = props.trend === "up" ? TrendingUpIcon : props.trend === "down" ? TrendingDownIcon : null;
</script>

<template>
  <div class="cardBackground relative flex min-w-28 flex-1 flex-col items-center rounded border p-2.5 text-center">
    <p v-if="props.iconSymbol" class="text-primary mb-1.5 text-xl">{{ props.iconSymbol }}</p>
    <component :is="props.icon" v-if="props.icon" class="stroke-primary mb-1.5" />
    <div class="flex items-center gap-1">
      <Transition name="fade" mode="out-in">
        <div v-if="props.isLoading" class="flex items-baseline gap-2 text-sm font-semibold">
          <Skeleton class="h-3.5 w-10" />
        </div>
        <div v-else class="text-foreground flex items-baseline gap-2 text-sm font-semibold">
          <NumberFlow :value="Number(props.value) || 0" class="leading-none" />
          <span v-if="props.suffix" class="text-muted-foreground text-xs leading-none">
            {{ props.suffix }}
          </span>
        </div>
      </Transition>
      <TrendIcon
        v-if="TrendIcon"
        :class="['absolute top-2 right-2 size-3', trend === 'up' ? 'stroke-success' : 'stroke-destructive']"
      />
    </div>
    <span class="text-muted-foreground text-xs leading-tight">{{ label }}</span>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
