<script setup lang="ts">
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { GaugeChart } from "echarts/charts";
import type { EChartsOption } from "echarts";
import { computed } from "vue";
import { useThemeStore } from "@/stores/theme";
import { capitalize, formatBytesToMB } from "@/lib/utils";
import Label from "@/components/ui/label/Label.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import type { StorageUsageSummary } from "@repo/validation";
import { twMerge } from "tailwind-merge";
import Spinner from "@/components/ui/spinner/Spinner.vue";

interface CircularProgressPrompts {
  storage: StorageUsageSummary["storage"] | undefined;
  isLoading: boolean;
}

const props = defineProps<CircularProgressPrompts>();

const themeStore = useThemeStore();

use([CanvasRenderer, GaugeChart]);

// Calculate percentage value
const percentageValue = computed(() => {
  if (!props.storage) return 0;
  if (props.storage.isUnlimited || props.storage.limit === 0) return 0;
  return Number(((props.storage.usage / props.storage.limit) * 100).toFixed(1));
});

// Build multi-layered gauge series for each category
const gaugeOptions = computed<EChartsOption>(() => {
  if (!props.storage || !props.storage.breakdown || props.storage.breakdown.length === 0 || props.storage.limit === 0)
    return {};
  // Sort sections by bytes descending for better visual stacking
  const totalPercentage = Math.min((props.storage.usage / props.storage.limit) * 100, 100);

  return {
    series: {
      type: "gauge",
      startAngle: 90,
      endAngle: -269.9999,
      radius: "80%",
      z: 0,

      progress: {
        show: true,
        width: 14,
        overlap: false,
        roundCap: true,
        lineStyle: {
          color: themeStore.colors.primary,
        },
      },
      axisLine: {
        lineStyle: {
          show: true,
          width: 13,
          color: [[1, themeStore.colors.muted]],
        },
      },

      detail: {
        valueAnimation: true,
        offsetCenter: [0, 10],
        formatter: () => `{percentage|${percentageValue.value.toFixed(1)}%}\n{label|used}`,
        rich: {
          percentage: {
            fontSize: 18,
            fontWeight: "bold",
            color: themeStore.colors.foreground,
          },
          label: {
            fontSize: 14,
            fontWeight: "normal",
            color: themeStore.colors.mutedForeground,
          },
        },
      },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },

      data: [
        {
          value: totalPercentage,
        },
      ],
    },
  };
});

const categoryColors: Record<string, string> = {
  VEHICLE: "bg-primary",
  IMAGE: "bg-blue-500",
  NOTE: "bg-notes",
  REFILL: "bg-refill",
  MAINTENANCE: "bg-maintenance",
  TODO: "bg-todo",
  SHOPPING_LIST: "bg-green-300",
  QUICK_LINK: "bg-blue-300",
};
</script>
<template>
  <div class="flex flex-col gap-8">
    <Card>
      <CardContent class="flex gap-6">
        <!-- Gauge for storage usage -->
        <div class="h-full w-full">
          <Label class="text-muted-foreground mb-4">Storage Usage</Label>
          <div class="relative h-48">
            <div v-if="isLoading" class="flex h-full flex-1 items-center justify-center">
              <Spinner class="stroke-muted-foreground size-20" />
            </div>
            <VChart v-else :option="gaugeOptions" autoresize />
          </div>
          <div class="text-center">
            <h3>{{ formatBytesToMB(props.storage?.usage) }} MB</h3>
            <span class="text-muted-foreground text-sm">
              <p v-if="props.storage?.isUnlimited" class="items-center">Unlimited Storage</p>
              <span v-else>of {{ formatBytesToMB(props.storage?.limit) }} MB used</span>
            </span>
          </div>
        </div>

        <!-- Break down by category -->
        <div class="hidden h-full w-full lg:block">
          <Label class="text-muted-foreground mb-6">Breakdown by Category</Label>
          <div class="flex h-full w-full flex-1 flex-col gap-5">
            <div v-for="category in props.storage?.breakdown" :key="category.category" class="space-y-1">
              <!--  headerl -->
              <div class="flex justify-between gap-6">
                <div class="flex items-center gap-2 text-sm">
                  <div :class="twMerge(categoryColors[category.category], 'aspect-square h-2 rounded-full')" />
                  {{ capitalize(category.category) }}
                </div>
                <span class="text-muted-foreground text-xs"> {{ formatBytesToMB(category.bytes) }} MB</span>
              </div>

              <!--  progress bar -->
              <div class="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div
                  :class="twMerge(categoryColors[category.category], 'h-2 rounded-full')"
                  :style="{
                    width: props.storage?.usage
                      ? ((category.bytes / props.storage.usage) * 100).toFixed(1) + '%'
                      : '0%',
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Mobile card -->
    <Card class="block h-full w-full lg:hidden">
      <CardContent>
        <Label class="text-muted-foreground mb-6">Breakdown by Category</Label>
        <div class="flex h-full w-full flex-1 flex-col gap-5">
          <div v-for="category in props.storage?.breakdown" :key="category.category" class="space-y-1">
            <!--  headerl -->
            <div class="flex justify-between gap-6">
              <div class="flex items-center gap-2 text-sm">
                <div :class="twMerge(categoryColors[category.category], 'aspect-square h-2 rounded-full')" />
                {{ capitalize(category.category) }}
              </div>
              <span class="text-muted-foreground text-xs"> {{ formatBytesToMB(category.bytes) }} MB</span>
            </div>

            <!--  progress bar -->
            <div class="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                :class="twMerge(categoryColors[category.category], 'h-2 rounded-full')"
                :style="{
                  width: props.storage?.usage ? ((category.bytes / props.storage.usage) * 100).toFixed(1) + '%' : '0%',
                }"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
