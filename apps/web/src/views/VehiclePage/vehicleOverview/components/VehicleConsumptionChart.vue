<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { fetchApi } from "@/lib/api";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import type { TRefillDatesForChart, TRefillForClient } from "@repo/validation";

const { activeVehicleId } = useActiveVehicle();
const timeRange = ref(30);

const { data: chartData } = useQuery<TRefillDatesForChart[]>({
  queryKey: ["vehicle-consumption-chart-data", activeVehicleId, timeRange],
  queryFn: async () => {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - timeRange.value);
    return await fetchApi(`/logs/refills/chart/${activeVehicleId.value}/${limitDate.toISOString()}`);
  },
  enabled: computed(() => !!activeVehicleId.value),
});

interface TChartItem {
  date: string;
  consumption?: {
    value: number;
    unit: string;
  };
  smoothingConsumption: number;
  refills?: TRefillForClient[];
}

// Bottom value for the chart Y axis
const chartMinValue = computed<number>(() => {
  if (!chartData.value) return 0;

  let sum = 0;
  let count = 0;

  for (const item of chartData.value) {
    if (item.consumption) {
      sum += item.consumption.value;
      count++;
    }
  }

  return Math.floor(sum / count / 2) || 0;
});

// Fill in missing dates and apply smoothing
const filledChartData = computed((): TChartItem[] => {
  if (!chartData.value) return [];

  const dataMap = new Map<string, TChartItem>();

  chartData.value.forEach((entry) => {
    dataMap.set(entry.date, { ...entry, smoothingConsumption: entry.consumption.value });
  });

  let lastValidConsumption: number = 0;

  for (let i = timeRange.value; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    if (!dateKey) throw new Error("Invalid date generated");

    // if date is missing
    if (!dataMap.has(dateKey)) {
      dataMap.set(dateKey, {
        date: dateKey,
        smoothingConsumption: lastValidConsumption,
      });
    } else {
      lastValidConsumption = dataMap.get(dateKey)!.smoothingConsumption;
    }
  }
  return Array.from(dataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

watch(filledChartData, () => {
  console.log("Updated filledChartData:", filledChartData.value);
  console.log("Chart min value:", chartMinValue.value);
});
</script>

<template>
  <Card class="flex min-h-0 flex-1 flex-col">
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
    <CardContent class="flex-1 px-2 pt-4 pb-4 sm:px-6 sm:pt-6">
      <div v-if="filledChartData.length > 0" autoresize class="flex-1" />

      <div v-else class="text-muted-foreground flex h-full items-center justify-center">
        No consumption data available for this period
      </div>
    </CardContent>
  </Card>
</template>
