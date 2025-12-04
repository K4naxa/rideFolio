<script setup lang="ts">
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Label from "@/components/ui/label/Label.vue";
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { type RecentActivityInfiniteResponse } from "@repo/validation";
import { useTimeAgo } from "@vueuse/core";
import { computed, ref } from "vue";
import VehicleRecentActivitySkeleton from "./VehicleRecentActivitySkeleton.vue";
import { capitalize } from "@/lib/utils";
import { useVehicleTimelineInfinite } from "@/lib/queries/vehicles/vehicle-queries";

const { currentVehicleId, currentVehicle } = useCurrentVehicle();

const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useVehicleTimelineInfinite(currentVehicleId);

const allActivities = computed<RecentActivityInfiniteResponse["items"]>(() => {
  return data.value?.pages.flatMap((page) => page.items) ?? [];
});

const isEmpty = computed(() => {
  return !isLoading.value && allActivities.value.length === 0;
});

const scrollAreaRef = ref<HTMLElement | null>(null);
const loadMoreTrigger = ref<HTMLElement | null>(null);
</script>

<template>
  <Card class="flex h-full flex-col">
    <CardHeader>
      <CardTitle> <Icon name="stats" class="stroke-primary" /> Recent activity</CardTitle>
      <CardDescription> Latest activity for {{ currentVehicle?.vehicleData.name || "your vehicle" }} </CardDescription>
    </CardHeader>
    <CardContent class="min-h-0 flex-1 rounded px-0">
      <ScrollArea ref="scrollAreaRef" class="h-full w-full">
        <div class="flex flex-col gap-4" v-auto-animate>
          <div v-if="isLoading" class="flex flex-col gap-8">
            <VehicleRecentActivitySkeleton />
            <VehicleRecentActivitySkeleton />
            <VehicleRecentActivitySkeleton />
          </div>
          <p v-else-if="isError" class="text-destructive text-center text-sm">Error loading recent activity.</p>
          <p v-else-if="isEmpty" class="text-muted-foreground text-center text-sm">No recent activity found.</p>

          <template v-else>
            <div v-for="activity in allActivities" :key="activity.data.id">
              <!-- Refill activity -->
              <div v-if="activity.type === 'refill'" class="hover:bg-accent/50 flex items-center gap-4 rounded p-2.5">
                <div class="bg-refill/30 grid size-10 place-content-center rounded">
                  <Icon name="refill" class="stroke-refill" size="sm" />
                </div>
                <div class="space-y-1">
                  <div class="flex gap-3">
                    <Label>Refill</Label>
                  </div>
                  <div class="flex gap-2.5">
                    <Badge variant="outline" class="px-2 py-1"
                      >{{ activity.data.fuelAmount.value }}
                      <p class="text-muted-foreground text-xs">{{ activity.data.fuelAmount.unit }}</p>
                    </Badge>
                    <Badge variant="outline" class="px-2 py-1" v-if="activity.data.consumption.value">
                      {{ activity.data.consumption.value }}
                      <p class="text-muted-foreground text-xs">{{ activity.data.consumption.unit }}</p>
                    </Badge>
                  </div>
                </div>
                <p class="text-muted-foreground ml-auto text-sm">{{ useTimeAgo(new Date(activity.data.date)) }}</p>
                <Button variant="outline" size="icon"> <Icon name="dotsHorizontal" /> </Button>
              </div>

              <!-- Maintenance activity -->
              <div
                v-if="activity.type === 'maintenance'"
                class="hover:bg-accent/50 flex items-center gap-4 rounded p-2.5"
              >
                <div class="bg-maintenance/30 grid size-10 place-content-center rounded">
                  <Icon name="maintenance" class="stroke-maintenance" size="sm" />
                </div>
                <div class="space-y-1">
                  <Label>Maintenance</Label>
                  <div class="text-muted-foreground flex items-center gap-4">
                    <p class="flex items-center">
                      <Icon :name="activity.data.type.icon as IconProps['name']" class="mr-1 inline-block size-4" />
                      {{ capitalize(activity.data.type.code) }}
                    </p>
                    <Badge v-if="activity.data.costTotal" variant="outline" class="px-2 py-1">
                      {{ activity.data.costTotal }} €
                    </Badge>
                  </div>
                </div>

                <p class="text-muted-foreground ml-auto text-sm">{{ useTimeAgo(new Date(activity.data.date)) }}</p>

                <Button variant="outline" size="icon"> <Icon name="dotsHorizontal" /> </Button>
              </div>
            </div>

            <div ref="loadMoreTrigger" class="py-4 text-center">
              <VehicleRecentActivitySkeleton v-if="isFetchingNextPage" />
              <Button
                v-else-if="hasNextPage"
                variant="link"
                @click="fetchNextPage"
                class="text-primary text-sm hover:underline"
              >
                Load more
              </Button>
              <p v-else class="text-muted-foreground text-sm">No more activities</p>
            </div>
          </template>
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
</template>
