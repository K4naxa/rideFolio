<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { fetchApi } from "@/lib/api";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import type { TRefillDatesForChart } from "@repo/validation";
import VChart from "vue-echarts";
import { graphic, use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import { TooltipComponent, GridComponent } from "echarts/components";
import { type EChartsOption } from "echarts";
import { useThemeStore } from "@/stores/theme";
import Label from "@/components/ui/label/Label.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import ButtonGroup from "@/components/ui/button-group/ButtonGroup.vue";

// Register ECharts components
use([CanvasRenderer, LineChart, TooltipComponent, GridComponent]);

const themeStore = useThemeStore();

const { activeVehicleId } = useActiveVehicle();
const timeRange = ref(30);

const {
  data: chartData,
  isLoading,
  isPlaceholderData,
  isError,
} = useQuery<TRefillDatesForChart[]>({
  queryKey: ["vehicle-consumption-chart-data", activeVehicleId, timeRange],
  queryFn: async () => {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - timeRange.value);

    return await fetchApi(`/logs/refills/chart/${activeVehicleId.value}/${limitDate.toISOString()}`);
  },
  enabled: computed(() => !!activeVehicleId.value),
  placeholderData: (prev) => prev,
});

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
      value: item.consumption.value,
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
          margin: 12,
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
      showSymbol: true,
      symbol: "circle",
      symbolSize: 6,

      lineStyle: {
        width: 1,
        color: "rgba(225, 113, 0, 0.5)",
      },
      areaStyle: {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#e17100" },
          { offset: 0.5, color: "rgba(225, 113, 0, 0.3)" }, // Semi-transparent orange
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
  <Card class="flex h-full w-full flex-col">
    <CardHeader class="flex items-center gap-2 space-y-0 border-b sm:flex-row">
      <div class="grid flex-1 gap-1">
        <CardTitle>Fuel consumption</CardTitle>
        <CardDescription> Showing consumption trends for the last {{ timeRange }} days </CardDescription>
      </div>
      <Select v-model="timeRange">
        <SelectTrigger class="hidden w-40 sm:ml-auto sm:flex" aria-label="Select a value">
          <SelectValue placeholder="Last 30 days" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="90"> Last 3 months </SelectItem>
          <SelectItem :value="30"> Last 30 days </SelectItem>
          <SelectItem :value="7"> Last 7 days </SelectItem>
        </SelectContent>
      </Select>
    </CardHeader>

    <!-- Chart -->
    <CardContent class="relative flex h-full min-h-80 w-full">
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
              <h4 class="font-semibold">
                {{
                  new Date(data.itemData?.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                }}
              </h4>
              <p class="text-muted-foreground text-sm">
                Consumption: <span>{{ data.itemData?.consumption?.value }} </span>
                <span class="ml-1 text-xs">{{ data.itemData?.consumption?.unit }}</span>
              </p>

              <div>
                <Label>Refills:</Label>
                <ul v-if="data.itemData?.refills && data.itemData?.refills.length > 0" class="flex flex-col gap-1">
                  <li v-for="(refill, index) in data.itemData?.refills" :key="index" class="flex gap-2">
                    <Badge variant="outline"
                      >{{ Number(refill.odometer.value).toLocaleString() }} {{ refill.odometer.unit }}</Badge
                    >
                    :
                    <Badge variant="secondary">
                      <span>{{ refill.fuelVolume.value }} </span>
                      <span class="text-muted-foreground ml-1 text-xs">{{ refill.fuelVolume.unit }}</span></Badge
                    >
                    @
                    <Badge variant="secondary">{{ refill.pricePerUnit }} € </Badge>
                  </li>
                </ul>
              </div>
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
    </CardContent>
  </Card>
</template>
<style scoped></style>
