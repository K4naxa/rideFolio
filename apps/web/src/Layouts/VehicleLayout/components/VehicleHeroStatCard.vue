<script setup lang="ts">
import { TrendingDownIcon, TrendingUpIcon, type LucideIcon } from "lucide-vue-next";
import NumberFlow from "@number-flow/vue";

import { Skeleton } from "@/components/ui/skeleton";
import type { IconProps } from "@/components/icons/Icon.vue";
import Icon from "@/components/icons/Icon.vue";

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  trend?: "up" | "down";
  iconSymbol?: string;
  icon?: IconProps["name"];
  isLoading?: boolean;
}
const props = defineProps<StatCardProps>();

const TrendIcon = props.trend === "up" ? TrendingUpIcon : props.trend === "down" ? TrendingDownIcon : null;
</script>

<template>
  <div class="flex-1 rounded border p-2.5">
    <div class="flex items-center gap-2.5">
      <p v-if="props.iconSymbol" class="text-primary mb-1.5 text-xl">{{ props.iconSymbol }}</p>
      <Icon :name="props.icon" v-else-if="props.icon" class="stroke-primary mb-1.5" />
      <h4 class="text-muted-foreground">{{ props.label }}</h4>
    </div>

    <div class="flex items-center gap-1">
      <Transition name="fade" mode="out-in">
        <div v-if="props.isLoading" class="flex items-baseline gap-2 text-xl font-semibold">
          <Skeleton class="h-3.5 w-10" />
        </div>
        <div v-else class="text-foreground flex items-baseline gap-2 text-xl font-semibold">
          <NumberFlow :value="Number(props.value) || 0" class="leading-none" />
          <span v-if="props.suffix" class="text-muted-foreground text-sm leading-none">
            {{ props.suffix }}
          </span>
        </div>
      </Transition>
      <TrendIcon
        v-if="TrendIcon"
        :class="['absolute top-2 right-2 size-3', props.trend === 'up' ? 'stroke-success' : 'stroke-destructive']"
      />
    </div>
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
