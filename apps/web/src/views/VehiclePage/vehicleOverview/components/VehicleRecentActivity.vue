<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { api } from "@/lib/api";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { type RecentActivityInfiniteResponse } from "@repo/validation";
import { useInfiniteQuery } from "@tanstack/vue-query";
import { computed } from "vue";

const { activeVehicleId, activeVehicle } = useActiveVehicle();

const LIMIT = 10;

const { data, fetchNextPage, hasNextPage, isFetchNextPage, isLoading, isError } = useInfiniteQuery({
  queryKey: ["vehicle-recent-activity", activeVehicleId],
  queryFn: async ({ pageParam }) => {
    const cursor = pageParam;
    const response = await api.get(`/vehicles/${activeVehicleId.value}/infiniteActivities/${cursor}/${LIMIT}`);
    return response.data;
  },
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  initialPageParam: "initial",
  enabled: computed(() => !!activeVehicleId.value),
});

const allActivities = computed<RecentActivityInfiniteResponse["items"]>(() => {
  return data.value?.pages.flatMap((page) => page.items) ?? [];
});

const isEmpty = computed(() => {
  return !isLoading.value && allActivities.value.length === 0;
});
</script>

<template>
  <Card class="flex min-h-0 flex-1 flex-col">
    <CardHeader>
      <CardTitle> <Icon name="stats" class="stroke-primary" /> Recent activity</CardTitle>
      <CardDescription> Latest activity for {{ activeVehicle?.vehicleData.name || "your vehicle" }} </CardDescription>
    </CardHeader>
    <Separator />
    <CardContent class="min-h-0 flex-1 rounded">
      <ScrollArea class="h-full">
        <div class="max-h-96 min-h-[150px]">
          <template v-if="isLoading">
            <p class="text-muted-foreground text-center text-sm"><Spinner /> Loading...</p>
          </template>
          <template v-else-if="isError">
            <p class="text-destructive text-center text-sm">Error loading recent activity.</p>
          </template>
          <template v-else-if="isEmpty">
            <p class="text-muted-foreground text-center text-sm">No recent activity found.</p>
          </template>
          <template v-else>
            <div v-for="activity in allActivities" :key="activity.data.id" class="mb-4 last:mb-0">
              {{ activity.data.id }} - {{ activity.type }} - {{ new Date(activity.date).toLocaleString() }}
            </div>
          </template>
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
</template>
