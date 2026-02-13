<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Label from "@/components/ui/label/Label.vue";
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { type RecentActivityInfiniteResponse } from "@repo/validation";
import { computed, ref, useTemplateRef } from "vue";
import VehicleRecentActivitySkeleton from "./VehicleRecentActivitySkeleton.vue";
import { useVehicleTimelineInfinite } from "@/lib/queries/vehicles/vehicle-queries";
import Separator from "@/components/ui/separator/Separator.vue";
import { EllipsisVertical } from "lucide-vue-next";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import Empty from "@/components/ui/empty/Empty.vue";
import EmptyHeader from "@/components/ui/empty/EmptyHeader.vue";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";

import { useIntersectionObserver } from "@vueuse/core";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";

const { currentVehicleId } = useCurrentVehicle();
const { preferredCurrencySymbol } = useCurrentUser();

const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useVehicleTimelineInfinite(currentVehicleId);

const allActivities = computed<RecentActivityInfiniteResponse["items"]>(() => {
  const flattened = data.value?.pages.flatMap((page) => page.items) ?? [];
  return flattened;
});

const isEmpty = computed(() => {
  return !isLoading.value && allActivities.value.length === 0;
});

const loadMoreTrigger = useTemplateRef("loadMoreTrigger");

useIntersectionObserver(loadMoreTrigger, ([entry]) => {
  if (entry?.isIntersecting && hasNextPage.value && !isFetchingNextPage.value && !isLoading.value) {
    fetchNextPage();
  } else {
  }
});
</script>

<template>
  <section class="flex w-full flex-col overflow-hidden">
    <div class="scrollbar-macos @container min-h-0 flex-1 overflow-y-auto rounded px-0">
      <div v-if="isLoading" class="flex flex-col gap-8">
        <VehicleRecentActivitySkeleton />
        <VehicleRecentActivitySkeleton />
        <VehicleRecentActivitySkeleton />
      </div>
      <p v-else-if="isError" class="text-destructive text-center text-sm">Error loading recent activity.</p>
      <Empty v-else-if="isEmpty">
        <EmptyDescription class="">Your recent vehicle activities will appear here.</EmptyDescription>
      </Empty>
      <ul v-else class="relative flex flex-col gap-3">
        <div class="absolute top-6 left-8 z-0 h-full border-l" />

        <li
          v-for="activity in allActivities"
          :key="activity.data.id"
          class="group hover:bg-accent/50 rounded px-2 py-2"
        >
          <!-- Refill activity -->
          <div v-if="activity.type === 'refill'" class="flex items-center gap-4">
            <div
              class="bg-background shadow-refill/30 z-10 mr-2 flex size-12 overflow-hidden rounded-full group-hover:shadow-md"
            >
              <div class="bg-refill/30 grid flex-1 place-content-center">
                <Icon name="refill" class="stroke-refill size-5" />
              </div>
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
                  <Badge class="bg-muted text-foreground px-2 py-1" v-if="activity.data.consumption.value">
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
          <div v-if="activity.type === 'maintenance'" class="flex items-center gap-4">
            <div
              class="bg-background shadow-maintenance/30 z-10 mr-2 flex size-12 overflow-hidden rounded-full group-hover:shadow-md"
            >
              <div class="bg-maintenance/30 grid flex-1 place-content-center">
                <Icon name="maintenance" class="stroke-maintenance size-5" />
              </div>
            </div>
            <div class="flex flex-col justify-center">
              <Label class="font-normal">{{ activity.data.title }}</Label>
              <div class="text-muted-foreground flex items-center gap-4">
                <p class="flex text-center text-sm">
                  {{ activity.data.notes }}
                </p>
              </div>
            </div>

            <div class="text-muted-foreground ml-auto hidden h-full text-end text-sm @[300px]:block">
              <p v-if="activity.data.costTotal">{{ activity.data.costTotal }} {{ preferredCurrencySymbol }}</p>
              <p class="">
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
        </li>
      </ul>
      <div ref="loadMoreTrigger" class="py-4 text-center">
        <Spinner v-if="isFetchingNextPage" class="stroke-muted-foreground size-12" />
      </div>
    </div>
  </section>
</template>
