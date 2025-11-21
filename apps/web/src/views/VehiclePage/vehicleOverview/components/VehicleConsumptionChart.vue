<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computed, ref } from "vue";
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

// Fill in missing dates and apply smoothing
const filledChartData = computed(() => {
  if (!chartData.value) return [];

  const dataMap = new Map<string, TRefillDatesForChart>(chartData.value.map((item) => [item.date, item]));

  // First pass: create array with all dates, filling missing consumption with previous value
  const rawData = Array.from({ length: timeRange.value }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (timeRange.value - 1 - i));
    const dateKey = date.toISOString().split("T")[0] ?? "";

    // Check if we have data for this date
    const existing = dataMap.get(dateKey);

    let consumption: number | null = null;
    let unit = "";
    let refills: TRefillForClient[] = [];

    // if existing date has consumption value, use it else use last known
    if (existing && existing.consumption.value !== null && existing.consumption.value !== undefined) {
      consumption = existing.consumption.value;
      unit = existing.consumption.unit;
      refills = existing.refills ?? [];
    }

    return {
      date: new Date(dateKey).getTime(),
      rawConsumption: consumption,
      consumptionUnit: unit,
      refills,
      dateKey,
    };
  });
  return rawData.map((d) => ({
    ...d,
    consumption: d.rawConsumption,
  }));
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
