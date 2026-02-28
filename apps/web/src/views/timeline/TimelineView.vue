<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import { useTimelineQuery } from "@/lib/queries/timeline/timeline-query.ts";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries";
import type { TimelineEventType, TimelineItem, TimelineQueryInput } from "@repo/validation";
import { twMerge } from "tailwind-merge";
import { computed, ref } from "vue";
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import DateInput from "@/components/forms/DateInput.vue";
import ResponsivePopover from "@/components/forms/ResponsivePopover.vue";

// ─── Filters state ──────────────────────────────────────────────────────────

const filters = ref<TimelineQueryInput>({
  vehicleId: undefined,
  limit: 20,
  eventTypes: [],
  startDate: null,
  endDate: null,
});

// Temporary state used inside the filter sheet before confirming
const tempVehicleId = ref<string>("");
const tempStartDate = ref<Date | undefined>(undefined);
const tempEndDate = ref<Date | undefined>(undefined);

// ─── Query ───────────────────────────────────────────────────────────────────

const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useTimelineQuery(filters);
const { data: vehicles } = useVehiclesAll();

const allItems = computed<TimelineItem[]>(() => data.value?.pages.flatMap((p) => p.items) ?? []);

// ─── Event type chips ────────────────────────────────────────────────────────

const typeFilters = [
  { type: "refill" as TimelineEventType, label: "Refills", icon: "refill" as const },
  { type: "maintenance" as TimelineEventType, label: "Maintenance", icon: "maintenance" as const },
  { type: "todo-created" as TimelineEventType, label: "Created", icon: "todo" as const },
  { type: "todo-completed" as TimelineEventType, label: "Completed", icon: "circleCheck" as const },
] as const;

const allTypesActive = computed(() => !filters.value.eventTypes || filters.value.eventTypes.length === 0);

const isTypeActive = (type: TimelineEventType) =>
  !allTypesActive.value && (filters.value.eventTypes ?? []).includes(type);

const toggleEventType = (type: TimelineEventType) => {
  const current = filters.value.eventTypes ?? [];
  filters.value = {
    ...filters.value,
    eventTypes: current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
  };
};

const setAllTypes = () => {
  filters.value = { ...filters.value, eventTypes: [] };
};

// ─── Advanced filter sheet ───────────────────────────────────────────────────

const advancedFilterCount = computed(() => {
  let c = 0;
  if (filters.value.vehicleId) c++;
  if (filters.value.startDate) c++;
  if (filters.value.endDate) c++;
  return c;
});

const applyFilters = (close: () => void) => {
  filters.value = {
    ...filters.value,
    vehicleId: tempVehicleId.value || undefined,
    startDate: tempStartDate.value ? new Date(tempStartDate.value) : null,
    endDate: tempEndDate.value ? new Date(tempEndDate.value) : null,
  };
  close();
};

const clearAdvancedFilters = (close: () => void) => {
  tempVehicleId.value = "";
  tempStartDate.value = undefined;
  tempEndDate.value = undefined;
  filters.value = { ...filters.value, vehicleId: undefined, startDate: null, endDate: null };
  close();
};

const clearAllFilters = () => {
  filters.value = { vehicleId: undefined, limit: 20, eventTypes: [], startDate: null, endDate: null };
};

const activeFilterCount = computed(() => advancedFilterCount.value + (filters.value.eventTypes?.length ?? 0));

// ─── Vehicle name helper ─────────────────────────────────────────────────────

const selectedVehicleName = computed(
  () => vehicles.value?.find((v) => v.vehicleData.id === filters.value.vehicleId)?.vehicleData.name ?? null,
);

// ─── Timeline grouping ───────────────────────────────────────────────────────

function dateGroupLabel(timestamp: Date | string): string {
  const date = new Date(timestamp);
  const today = new Date();
  if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth()) return "This Month";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const groupedItems = computed(() => {
  const groups = new Map<string, TimelineItem[]>();
  for (const item of allItems.value) {
    const key = dateGroupLabel(item.timestamp);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return [...groups.entries()];
});

function formatTime(ts: Date | string) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(ts: Date | string) {
  return new Date(ts).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

// ─── Event type visual config ─────────────────────────────────────────────────

const typeConfig = {
  refill: {
    icon: "refill" as const,
    label: "Fuel Refill",
    iconClass: "text-blue-500",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/15",
  },
  maintenance: {
    icon: "maintenance" as const,
    label: "Maintenance",
    iconClass: "text-amber-500",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/15",
  },
  "todo-created": {
    icon: "todo" as const,
    label: "Task Created",
    iconClass: "text-violet-500",
    bgClass: "bg-violet-500/10 dark:bg-violet-500/15",
  },
  "todo-completed": {
    icon: "circleCheck" as const,
    label: "Task Completed",
    iconClass: "text-green-500",
    bgClass: "bg-green-500/10 dark:bg-green-500/15",
  },
} as const;
</script>

<template>
  <MainContentWrapper>
    <div class="flex w-full flex-col py-4 lg:py-8">
      <!-- ── Header ──────────────────────────────────────────────── -->
      <header class="mb-5 flex items-center justify-between gap-3">
        <h3 class="shrink-0">Timeline</h3>

        <div class="flex items-center gap-2">
          <!-- Clear all – visible only when any filter is active -->
          <Button
            v-if="activeFilterCount > 0"
            variant="ghost"
            size="sm"
            class="text-muted-foreground"
            @click="clearAllFilters"
          >
            <Icon name="close" />
            <span class="hidden sm:inline">Clear</span>
          </Button>

          <!-- Advanced filter button -->

          <ResponsivePopover title="Filters" description="Select custom filters for the timeline view.">
            <template #trigger>
              <Button variant="outline" size="sm" class="relative">
                <Icon name="filter" />
                <span class="hidden sm:inline">Filters</span>
                <span
                  v-if="advancedFilterCount > 0"
                  class="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-bold"
                >
                  {{ advancedFilterCount }}
                </span>
              </Button>
            </template>

            <template #content>
              <div class="gaps-sm flex flex-col md:w-sm">
                <div>
                  <VehicleSelect
                    placeholder="Select a vehicle"
                    :value="tempVehicleId"
                    @value-change="(value) => (tempVehicleId = value)"
                  />
                </div>
                <div class="gaps-sm grid grid-cols-2">
                  <date-input placeholder="Select a date" label="From" v-model="tempStartDate" />
                  <date-input placeholder="Select a date" label="To" v-model="tempEndDate" />
                </div>
              </div>
            </template>

            <template #footer="{ close }">
              <Button variant="outline" @click="clearAdvancedFilters(close)">Clear filters</Button>
              <Button variant="default" @click="applyFilters(close)">Apply</Button>
            </template>
          </ResponsivePopover>
        </div>
      </header>

      <!-- ── Event-type chip row ──────────────────────────────────── -->
      <div class="scrollbar-none mobileOffScreenScroll mb-5 flex gap-2 overflow-x-auto">
        <!-- All -->
        <button
          :class="
            twMerge(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              allTypesActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
            )
          "
          @click="setAllTypes"
        >
          All
        </button>

        <!-- Per-type chips -->
        <button
          v-for="tf in typeFilters"
          :key="tf.type"
          :class="
            twMerge(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              isTypeActive(tf.type)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
            )
          "
          @click="toggleEventType(tf.type)"
        >
          <Icon :name="tf.icon" size="sm" />
          {{ tf.label }}
        </button>
      </div>

      <!-- ── Active advanced-filter badges ───────────────────────── -->
      <div
        v-if="selectedVehicleName || filters.startDate || filters.endDate"
        class="mb-4 flex flex-wrap items-center gap-2"
      >
        <span class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Filtered by</span>

        <Badge v-if="selectedVehicleName" variant="secondary" class="gap-1">
          <Icon name="car" size="sm" />
          {{ selectedVehicleName }}
        </Badge>
        <Badge v-if="filters.startDate" variant="secondary" class="gap-1">
          <Icon name="calendar" size="sm" />
          From {{ formatDate(filters.startDate) }}
        </Badge>
        <Badge v-if="filters.endDate" variant="secondary" class="gap-1">
          <Icon name="calendar" size="sm" />
          To {{ formatDate(filters.endDate) }}
        </Badge>
      </div>

      <!-- ── Loading skeletons ────────────────────────────────────── -->
      <div v-if="isLoading" class="flex flex-col">
        <div v-for="i in 5" :key="i" class="mb-6 flex gap-3">
          <div class="flex w-8 shrink-0 flex-col items-center gap-2">
            <Skeleton class="size-8 rounded-full" />
            <Skeleton class="h-16 w-0.5 rounded-full" />
          </div>
          <div class="flex-1 space-y-2 pt-1">
            <Skeleton class="h-3 w-24 rounded" />
            <Skeleton class="h-14 w-full rounded-lg" />
          </div>
        </div>
      </div>

      <!-- ── Empty state ──────────────────────────────────────────── -->
      <div v-else-if="allItems.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="bg-muted mb-4 rounded-full p-4">
          <Icon name="calendar" class="text-muted-foreground" size="lg" />
        </div>
        <p class="font-medium">No events found</p>
        <p class="text-muted-foreground mt-1 max-w-xs text-sm">
          Try adjusting your filters or check back once you've logged some activity.
        </p>
        <Button v-if="activeFilterCount > 0" variant="outline" size="sm" class="mt-5" @click="clearAllFilters">
          Clear filters
        </Button>
      </div>

      <!-- ── Timeline ─────────────────────────────────────────────── -->
      <div v-else class="flex flex-col">
        <template v-for="([dateGroup, groupItems], groupIdx) in groupedItems" :key="dateGroup">
          <!-- Date-group divider -->
          <div :class="twMerge('mb-4 flex items-center gap-3', groupIdx > 0 && 'mt-8')">
            <span class="text-muted-foreground shrink-0 text-xs font-semibold tracking-widest uppercase">
              {{ dateGroup }}
            </span>
            <div class="bg-border h-px flex-1" />
          </div>

          <!-- Items -->
          <div v-for="(item, itemIdx) in groupItems" :key="`${item.type}-${itemIdx}`" class="flex gap-3">
            <!-- Icon + connector -->
            <div class="flex w-8 shrink-0 flex-col items-center">
              <div
                class="w-px flex-1"
                :class="twMerge('mb-1 w-px flex-1', itemIdx === 0 ? 'bg-transparent' : 'bg-border')"
                style="min-height: 1.5rem"
              />
              <div
                :class="
                  twMerge(
                    'flex size-8 shrink-0 items-center justify-center rounded-full',
                    typeConfig[item.type].bgClass,
                  )
                "
              >
                <Icon :name="typeConfig[item.type].icon" size="sm" :class="typeConfig[item.type].iconClass" />
              </div>
              <!-- Connector line to next item -->
              <div
                :class="twMerge('mt-1 w-px flex-1', itemIdx === groupItems.length - 1 ? 'bg-transparent' : 'bg-border')"
                style="min-height: 1.5rem"
              />
            </div>

            <!-- Content card -->
            <div class="cardBackground mb-3 min-w-0 flex-1 rounded-lg border px-4 py-3 shadow-xs">
              <!-- ── Refill ── -->
              <template v-if="item.type === 'refill'">
                <div class="flex items-start justify-between gap-2">
                  <span class="text-sm font-medium">Fuel Refill</span>
                  <span class="text-muted-foreground shrink-0 text-xs">{{ formatTime(item.timestamp) }}</span>
                </div>
                <div class="text-muted-foreground mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span class="flex items-center gap-1">
                    <Icon name="refill" size="sm" />
                    {{ item.data.fuelVolume.value }} {{ item.data.fuelVolume.unit }}
                  </span>
                  <span v-if="item.data.costTotal" class="flex items-center gap-1">
                    <Icon name="billing" size="sm" />
                    {{ item.data.costTotal.toFixed(2) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon name="odoDistance" size="sm" />
                    {{ item.data.odometer.value }} {{ item.data.odometer.unit }}
                  </span>
                </div>
                <p v-if="item.data.notes" class="text-muted-foreground mt-1.5 line-clamp-2 text-xs">
                  {{ item.data.notes }}
                </p>
              </template>

              <!-- ── Maintenance ── -->
              <template v-else-if="item.type === 'maintenance'">
                <div class="flex items-start justify-between gap-2">
                  <span class="text-sm font-medium">{{ item.data.title }}</span>
                  <span class="text-muted-foreground shrink-0 text-xs">{{ formatTime(item.timestamp) }}</span>
                </div>
                <div class="text-muted-foreground mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span class="flex items-center gap-1">
                    <Icon name="odoDistance" size="sm" />
                    {{ item.data.odometerData.value }} {{ item.data.odometerData.unit }}
                  </span>
                  <span v-if="item.data.costTotal" class="flex items-center gap-1">
                    <Icon name="billing" size="sm" />
                    {{ item.data.costTotal.toFixed(2) }}
                  </span>
                </div>
                <div v-if="item.data.parts.length > 0" class="mt-2 flex flex-wrap gap-1">
                  <Badge v-for="part in item.data.parts.slice(0, 3)" :key="part.partId" variant="muted" class="text-xs">
                    {{ part.customName || part.partCode }}
                  </Badge>
                  <Badge v-if="item.data.parts.length > 3" variant="muted" class="text-xs">
                    +{{ item.data.parts.length - 3 }}
                  </Badge>
                </div>
                <p v-if="item.data.notes" class="text-muted-foreground mt-1.5 line-clamp-2 text-xs">
                  {{ item.data.notes }}
                </p>
              </template>

              <!-- ── Todo Created ── -->
              <template v-else-if="item.type === 'todo-created'">
                <div class="flex items-start justify-between gap-2">
                  <span class="text-sm font-medium">{{ item.data.title }}</span>
                  <span class="text-muted-foreground shrink-0 text-xs">{{ formatTime(item.timestamp) }}</span>
                </div>
                <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge variant="muted" class="text-xs">Task created</Badge>
                  <Badge v-if="item.data.priority" variant="muted" class="text-xs capitalize">
                    {{ item.data.priority.toLowerCase() }}
                  </Badge>
                </div>
                <p v-if="item.data.description" class="text-muted-foreground mt-1.5 line-clamp-2 text-xs">
                  {{ item.data.description }}
                </p>
              </template>

              <!-- ── Todo Completed ── -->
              <template v-else-if="item.type === 'todo-completed'">
                <div class="flex items-start justify-between gap-2">
                  <span class="text-sm font-medium">{{ item.data.title }}</span>
                  <span class="text-muted-foreground shrink-0 text-xs">{{ formatTime(item.timestamp) }}</span>
                </div>
                <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge variant="muted" class="text-xs text-green-600 dark:text-green-400"> Task completed </Badge>
                  <Badge v-if="item.data.priority" variant="muted" class="text-xs capitalize">
                    {{ item.data.priority.toLowerCase() }}
                  </Badge>
                </div>
                <p v-if="item.data.description" class="text-muted-foreground mt-1.5 line-clamp-2 text-xs">
                  {{ item.data.description }}
                </p>
              </template>
            </div>
          </div>
        </template>

        <!-- Load more / End indicator -->
        <div class="mt-4 flex justify-center pb-8">
          <Button
            v-if="hasNextPage"
            variant="outline"
            size="sm"
            :disabled="isFetchingNextPage"
            @click="fetchNextPage()"
          >
            <Icon v-if="isFetchingNextPage" name="retry" class="animate-spin" />
            {{ isFetchingNextPage ? "Loading…" : "Load more" }}
          </Button>
          <p v-else class="text-muted-foreground text-xs">All events loaded</p>
        </div>
      </div>
    </div>
  </MainContentWrapper>
</template>

<style scoped></style>
