<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Label from "@/components/ui/label/Label.vue";
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { api } from "@/lib/api";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { capitalize } from "@/lib/utility/capitalize";
import { type RecentActivityInfiniteResponse } from "@repo/validation";
import { useInfiniteQuery } from "@tanstack/vue-query";
import { useTimeAgo } from "@vueuse/core";
import { computed } from "vue";

const { activeVehicleId, activeVehicle } = useActiveVehicle();

const LIMIT = 10;

const { data, isLoading, isError } = useInfiniteQuery({
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
    <CardContent class="min-h-0 flex-1 rounded px-0">
      <ScrollArea class="h-full w-full px-2.5">
        <div class="flex flex-col gap-4" v-auto-animate>
          <p v-if="isLoading" class="text-muted-foreground mx-auto my-8 flex items-center gap-2 text-center">
            <Spinner /> Loading...
          </p>
          <p v-else-if="isError" class="text-destructive text-center text-sm">Error loading recent activity.</p>
          <p v-else-if="isEmpty" class="text-muted-foreground text-center text-sm">No recent activity found.</p>

          <template v-else>
            <div v-for="activity in allActivities" :key="activity.data.id">
              <!-- Refill activity -->
              <div v-if="activity.type === 'refill'" class="hover:bg-accent/50 flex items-center gap-4 rounded p-2.5">
                <div class="bg-refill/30 rounded p-2.5"><Icon name="refill" class="stroke-refill" /></div>
                <div class="space-y-1">
                  <div class="flex gap-3">
                    <Label>Refill</Label>
                  </div>
                  <div class="flex gap-2.5">
                    <Badge variant="outline" class="px-2 py-1"
                      >{{ activity.data.fuelAmount.value }}
                      <p class="text-muted-foreground text-xs">{{ activity.data.fuelAmount.unit }}</p>
                    </Badge>
                    <Badge variant="outline" class="px-2 py-1">
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
                <div class="bg-maintenance/20 rounded p-2.5">
                  <Icon name="maintenance" class="stroke-maintenance" />
                </div>
                <div class="space-y-1">
                  <Label>Maintenance</Label>
                  <div class="text-muted-foreground">
                    {{ capitalize(activity.data.maintenanceType) }}
                    <Badge v-if="activity.data.costTotal" variant="outline" class="px-2 py-1">
                      {{ activity.data.costTotal }} €
                    </Badge>
                  </div>
                </div>

                <p class="text-muted-foreground ml-auto text-sm">{{ useTimeAgo(new Date(activity.data.date)) }}</p>

                <Button variant="outline" size="icon"> <Icon name="dotsHorizontal" /> </Button>
              </div>
            </div>
          </template>
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
</template>
