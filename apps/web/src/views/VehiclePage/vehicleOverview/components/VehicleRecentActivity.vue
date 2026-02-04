<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Label from "@/components/ui/label/Label.vue";
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { type RecentActivityInfiniteResponse } from "@repo/validation";
import { formatDate, useTimeAgo } from "@vueuse/core";
import { computed, ref } from "vue";
import VehicleRecentActivitySkeleton from "./VehicleRecentActivitySkeleton.vue";
import { useVehicleTimelineInfinite } from "@/lib/queries/vehicles/vehicle-queries";
import Separator from "@/components/ui/separator/Separator.vue";
import { EllipsisVertical } from "lucide-vue-next";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";

const { currentVehicleId, currentVehicle } = useCurrentVehicle();
const { preferredCurrencySymbol } = useCurrentUser();

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
  <section class="flex flex-1 flex-col overflow-hidden">
    <header class="">
      <div class="flex justify-between gap-4">
        <h2 class="font-medium">Recent activity</h2>
        <Button variant="ghost" size="icon-sm">
          <EllipsisVertical />
        </Button>
      </div>
      <Separator class="mt-1" />
    </header>

    <div class="@container mt-2 min-h-0 flex-1 rounded px-0">
      <ScrollArea class="h-full w-full">
        <ul class="flex flex-col divide-y" v-auto-animate>
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
              <div v-if="activity.type === 'refill'" class="flex items-center gap-4 rounded py-3">
                <div class="bg-refill/30 grid size-10 place-content-center rounded">
                  <Icon name="refill" class="stroke-refill" size="sm" />
                </div>
                <div class="space-y-1">
                  <div class="flex gap-3">
                    <Label class="font-normal">Refill</Label>
                  </div>
                  <div class="flex gap-4">
                    <div class="flex items-center gap-2">
                      <span class="text-muted-foreground text-sm">Amount: </span>
                      <Badge variant="outline" class="px-2 py-1"
                        >{{ activity.data.fuelAmount.value }}
                        <p class="text-muted-foreground text-xs">{{ activity.data.fuelAmount.unit }}</p>
                      </Badge>
                    </div>
                    <div v-if="activity.data.consumption.value" class="flex items-center gap-2">
                      <span class="text-muted-foreground text-sm">Avg: </span>
                      <Badge class="bg-muted px-2 py-1" v-if="activity.data.consumption.value">
                        {{ activity.data.consumption.value }}
                        <p class="text-muted-foreground text-xs">{{ activity.data.consumption.unit }}</p>
                      </Badge>
                    </div>
                  </div>
                </div>
                <div class="text-muted-foreground ml-auto hidden text-end text-sm @[300px]:block">
                  <p>{{ activity.data.costTotal }} {{ preferredCurrencySymbol }}</p>
                  <p>
                    {{
                      new Date(activity.data.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  </p>
                </div>
              </div>

              <!-- Maintenance activity -->
              <div v-if="activity.type === 'maintenance'" class="flex items-center gap-4 rounded py-3">
                <div class="bg-maintenance/30 grid size-10 place-content-center rounded">
                  <Icon name="maintenance" class="stroke-maintenance" size="sm" />
                </div>
                <div class="flex flex-col justify-center">
                  <Label class="font-normal">{{ activity.data.title }}</Label>
                  <div class="text-muted-foreground flex items-center gap-4">
                    <p class="flex text-center text-sm">
                      {{ activity.data.notes }}
                    </p>
                  </div>
                </div>

                <div class="text-muted-foreground ml-auto hidden text-end text-sm @[300px]:block">
                  <p>{{ activity.data.costTotal }} {{ preferredCurrencySymbol }}</p>
                  <p>
                    {{
                      new Date(activity.data.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  </p>
                </div>
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
        </ul>
      </ScrollArea>
    </div>
  </section>
</template>
