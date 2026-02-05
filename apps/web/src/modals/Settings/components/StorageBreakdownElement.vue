<script setup lang="ts">
import FetchError from "@/components/ui/FetchError.vue";
import Label from "@/components/ui/label/Label.vue";
import Progressbar from "@/components/ui/Progressbar.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import { useStorageBreakdown } from "@/lib/queries/user/user-queries";
import { capitalize, formatBytesToMB } from "@/lib/utils";
import { computed } from "vue";

const categoryColors: Record<string, string> = {
  VEHICLE: "bg-primary",
  IMAGE: "bg-blue-500",
  NOTE: "bg-notes",
  REFILL: "bg-refill",
  MAINTENANCE: "bg-maintenance",
  TODO: "bg-todo",
  SHOPPING_LIST: "bg-green-300",
  QUICK_LINK: "bg-blue-300",
  OTHER: "bg-muted-foreground",
};

const { data, isLoading, isError, refetch, isFetching } = useStorageBreakdown();

const topCategoriesBreakdown = computed(() => {
  const otherCategories = data.value?.breakdown.slice(3) || [];
  const topCategories = data.value?.breakdown.slice(0, 3) || [];
  return [
    ...(topCategories || []),
    {
      category: "OTHER",
      bytes: otherCategories.reduce((acc, curr) => acc + curr.bytes, 0),
    },
  ];
});

const getPercentage = (used: number): number => {
  return (used / data.value!.usage) * 100;
};
</script>
<template>
  <div class="h-full">
    <header>
      <Label class="text-muted-foreground mb-4">Storage Breakdown</Label>
    </header>

    <FetchError v-if="isError" :refetch="refetch" :isFetching="isFetching" />

    <template v-if="isLoading" class="flex flex-col gap-6">
      <div v-for="n in 4" class="space-y-2">
        <Skeleton class="h-4 w-32" />
        <Skeleton class="h-3 w-full" />
      </div>
    </template>

    <div v-else class="space-y-4">
      <div v-for="category in topCategoriesBreakdown" :key="category.category">
        <div class="flex items-center justify-between gap-4">
          <Label class="text-muted-foreground"> {{ capitalize(category.category) }}</Label>
          <span class="text-muted-foreground text-sm">{{ formatBytesToMB(category.bytes) }} MB used</span>
        </div>
        <Progressbar :percent="getPercentage(category.bytes)" :bar-class="categoryColors[category.category]" />
      </div>
    </div>
  </div>
</template>
