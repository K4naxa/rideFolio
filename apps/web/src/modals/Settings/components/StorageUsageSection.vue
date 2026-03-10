<script setup lang="ts">
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { GaugeChart } from "echarts/charts";
import type { EChartsOption } from "echarts";
import { computed } from "vue";
import { useThemeStore } from "@/stores/theme";
import { formatBytesToMB } from "@/lib/utils";
import Label from "@/components/ui/label/Label.vue";

import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";

const { currentUser, isLoading } = useCurrentUser();
const themeStore = useThemeStore();
use([CanvasRenderer, GaugeChart]);

// Calculate percentage value
const percentageValue = computed(() => {
  if (!currentUser.value) return 0;
  if (currentUser.value.subscriptionPlan.maxStorageBytes === -1) return 100;
  return Number(
    ((currentUser.value.usedStorageBytes / currentUser.value.subscriptionPlan.maxStorageBytes) * 100).toFixed(1),
  );
});

// Build multi-layered gauge series for each category
const gaugeOptions = computed<EChartsOption>(() => {
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
          color: themeStore.colors.accent,
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
          value: percentageValue.value,
        },
      ],
    },
  };
});
</script>
<template>
  <section v-if="currentUser && !isLoading" class="flex flex-col gap-10">
    <!-- Gauge for storage usage -->
    <div class="flex h-full w-full flex-2 flex-col justify-start">
      <Label class="text-muted-foreground mb-2">Storage Usage</Label>
      <div class="relative h-48">
        <div v-if="isLoading" class="flex h-full flex-1 items-center justify-center">
          <Spinner class="stroke-muted-foreground size-20" />
        </div>
        <VChart v-else :option="gaugeOptions" autoresize />
      </div>
      <div class="text-center">
        <h3>{{ formatBytesToMB(currentUser.usedStorageBytes) }} MB</h3>
        <span class="text-muted-foreground text-sm">
          <p v-if="currentUser.subscriptionPlan.maxStorageBytes === -1" class="items-center">Unlimited Storage</p>
          <span v-else>of {{ formatBytesToMB(currentUser.subscriptionPlan.maxStorageBytes) }} MB used</span>
        </span>
      </div>
    </div>
  </section>

  <section v-else class="grid flex-1 place-items-center">
    <Spinner class="stroke-muted-foreground size-20" />
  </section>
</template>
