<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computed, ref, watch } from "vue";

import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import VChart from "vue-echarts";
import { graphic, use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import { TooltipComponent, GridComponent } from "echarts/components";
import { type EChartsOption } from "echarts";
import { useThemeStore } from "@/stores/theme";
import Label from "@/components/ui/label/Label.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useVehicleConsumptionChart } from "@/lib/queries/vehicles/vehicle-queries";
import Icon from "@/components/icons/Icon.vue";
import { EllipsisVerticalIcon } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import Badge from "@/components/ui/badge/Badge.vue";

// Register ECharts components
use([CanvasRenderer, LineChart, TooltipComponent, GridComponent]);

const themeStore = useThemeStore();

const { currentVehicleId } = useCurrentVehicle();
const timeRange = ref(90); // days

const {
  data: chartData,
  isLoading,
  isPlaceholderData,
  isError,
} = useVehicleConsumptionChart(currentVehicleId, timeRange);

watch(chartData, (newData) => {
  console.log("Chart data updated:", newData);
});

// Chart options
const chartOptions = computed((): EChartsOption => {
  if (!chartData.value) {
    return {};
  }

  const xAxisData = chartData.value
    .filter((item) => typeof item.consumption?.value === "number")
    .map((item) => {
      const date = new Date(item.date);

      return date.toLocaleDateString(undefined, {
        month: "numeric",
        day: "numeric",
      });
    });

  const yAxisData = chartData.value
    .filter((item) => typeof item.consumption?.value === "number")

    .map((item) => ({
      value: item.consumption?.value,
      itemData: item,
    }));

  return {
    tooltip: {
      trigger: "axis",
      backgroundColor: "transparent",
      borderWidth: 0,
      padding: 0,
      extraCssText: "box-shadow: none;",
      z: 0,
      zlevel: 0,
    },

    xAxis: {
      type: "category",

      boundaryGap: false,
      data: xAxisData,
      axisLabel: {
        color: themeStore.colors.mutedForeground,
        fontSize: 10,
        margin: 12,
        opacity: 0.8,
        formatter: (value: string) =>
          new Date(value).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
      },
    },

    yAxis: [
      {
        type: "value",
        scale: true,
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: themeStore.colors.mutedForeground,
          fontSize: 10,
          opacity: 0.8,
          margin: 20,
          formatter: (value: number) => (Number.isInteger(value) ? value.toString() : ""),
          align: "center",
        },
        splitLine: {
          lineStyle: {
            color: themeStore.colors.muted,
            opacity: 0.4,
          },
        },
      },
    ],

    grid: {
      left: "0",
      right: "0",
      bottom: "0",
      top: "0",
    },

    series: {
      type: "line",
      smooth: true,
      showSymbol: false,
      symbol: "circle",
      symbolSize: 6,

      lineStyle: {
        width: 2,
        color: "rgba(225, 113, 0, 0.8)",
      },
      areaStyle: {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(225, 113, 0, 0.7)" },
          { offset: 0.5, color: "rgba(225, 113, 0, 0.3)" },
          { offset: 1, color: "rgba(225, 113, 0, 0)" },
        ]),
        origin: "start",
      },
      data: yAxisData,
    },
  };
});
</script>

<template>
  <div class="flex h-full w-full flex-col">
    <header class="mb-4 flex items-center justify-between gap-4">
      <div>
        <h2 class="flex items-center gap-2 font-medium"><Icon name="refill" class="size-5" /> Fuel consumption</h2>
        <CardDescription class="text-muted-foreground flex gap-2 text-sm md:hidden">
          <span class="text-muted-foreground">Avg.</span>
          <span>11.2 L/100km</span>
        </CardDescription>
      </div>

      <!-- TODO: Implement correct average for selected time -->
      <div class="flex items-center gap-4">
        <div class="hidden items-center gap-1 text-sm md:flex">
          <span class="text-muted-foreground">Avg.</span>
          <span class="font-medium">11.2 L/100km</span>
        </div>

        <Button variant="ghost" size="icon-sm" class=""><EllipsisVerticalIcon /></Button>
      </div>
    </header>

    <!-- Chart -->
    <div class="border-border/50 relative flex h-full w-full flex-1">
      <div
        v-if="isLoading || isPlaceholderData"
        class="bg-card/30 absolute bottom-0 left-0 z-10 grid h-full w-full place-items-center"
      >
        <span class="text-muted-foreground animate-pulse"> <Spinner class="size-12" /> </span>
      </div>
      <VChart :option="chartOptions" autoresize class="chart">
        <template #tooltip="params: any">
          <div class="bg-background/90 text-foreground z-0 rounded p-2 text-sm shadow-lg">
            <div v-for="({ data }, i) in params" :key="i" class="flex flex-col gap-2">
              <Label class="text-muted-foreground">
                {{
                  new Date(data.itemData?.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                }}
              </Label>
              <p>
                <span class="text-base font-semibold">{{ data.itemData?.consumption?.value }} </span>
                <span class="text-md text-muted-foreground ml-1">{{ data.itemData?.consumption?.unit }}</span>
              </p>
            </div>
          </div>
        </template>
      </VChart>
      <div v-if="chartData && chartData.length < 1" class="absolute inset-0 grid place-items-center">
        <p class="text-muted-foreground m-auto text-center">Not enough data to display consumption chart.</p>
      </div>
      <div v-if="isError" class="bg-background/70 absolute inset-0 grid place-items-center">
        <p class="text-destructive m-auto text-center">Error loading consumption data.</p>
      </div>
    </div>
  </div>
</template>
