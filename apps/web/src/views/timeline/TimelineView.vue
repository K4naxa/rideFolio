<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import Sheet from "@/components/ui/sheet/Sheet.vue";
import SheetContent from "@/components/ui/sheet/SheetContent.vue";
import SheetFooter from "@/components/ui/sheet/SheetFooter.vue";
import SheetHeader from "@/components/ui/sheet/SheetHeader.vue";
import SheetTitle from "@/components/ui/sheet/SheetTitle.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import { useTimelineQuery } from "@/lib/queries/timeline/timeline-query.ts";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries";
import type { TimelineEventType, TimelineItem, TimelineQueryInput } from "@repo/validation";
import { twMerge } from "tailwind-merge";
import { computed, ref } from "vue";

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
const tempStartDate = ref<string>("");
const tempEndDate = ref<string>("");

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

const filtersOpen = ref(false);

const advancedFilterCount = computed(() => {
  let c = 0;
  if (filters.value.vehicleId) c++;
  if (filters.value.startDate) c++;
  if (filters.value.endDate) c++;
  return c;
});

const openFilters = () => {
  tempVehicleId.value = filters.value.vehicleId ?? "";
  tempStartDate.value = filters.value.startDate ? new Date(filters.value.startDate).toISOString().split("T")[0] : "";
  tempEndDate.value = filters.value.endDate ? new Date(filters.value.endDate).toISOString().split("T")[0] : "";
  filtersOpen.value = true;
};

const applyFilters = () => {
  filters.value = {
    ...filters.value,
    vehicleId: tempVehicleId.value || undefined,
    startDate: tempStartDate.value ? new Date(tempStartDate.value) : null,
    endDate: tempEndDate.value ? new Date(tempEndDate.value) : null,
  };
  filtersOpen.value = false;
};

const clearAdvancedFilters = () => {
  tempVehicleId.value = "";
  tempStartDate.value = "";
  tempEndDate.value = "";
  filters.value = { ...filters.value, vehicleId: undefined, startDate: null, endDate: null };
  filtersOpen.value = false;
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

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateGroupLabel(timestamp: Date | string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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
          <Button variant="outline" size="sm" class="relative" @click="openFilters">
            <Icon name="filter" />
            <span class="hidden sm:inline">Filters</span>
            <!-- Active count pill -->
            <span
              v-if="advancedFilterCount > 0"
              class="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-bold"
            >
              {{ advancedFilterCount }}
            </span>
          </Button>
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
                v-if="itemIdx < groupItems.length - 1"
                class="bg-border mt-1 w-px flex-1"
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

  <!-- ── Filter sheet ──────────────────────────────────────────────── -->
  <Sheet v-model:open="filtersOpen">
    <SheetContent side="bottom" class="max-h-[85dvh] overflow-y-auto rounded-t-xl">
      <SheetHeader class="text-left">
        <SheetTitle>Filters</SheetTitle>
      </SheetHeader>

      <div class="flex flex-col gap-6 py-4">
        <!-- Vehicle -->
        <div class="flex flex-col gap-2">
          <Label class="text-sm font-medium">Vehicle</Label>
          <Select v-model="tempVehicleId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="All vehicles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All vehicles</SelectItem>
              <SelectItem v-for="v in vehicles" :key="v.vehicleData.id" :value="v.vehicleData.id">
                {{ v.vehicleData.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Date range -->
        <div class="flex flex-col gap-2">
          <Label class="text-sm font-medium">Date range</Label>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <Label class="text-muted-foreground text-xs">From</Label>
              <Input v-model="tempStartDate" type="date" />
            </div>
            <div class="flex flex-col gap-1.5">
              <Label class="text-muted-foreground text-xs">To</Label>
              <Input v-model="tempEndDate" type="date" />
            </div>
          </div>
        </div>
      </div>

      <SheetFooter class="flex flex-col-reverse gap-2 sm:flex-row">
        <Button variant="outline" class="flex-1" @click="clearAdvancedFilters"> Clear filters </Button>
        <Button class="flex-1" @click="applyFilters"> Apply </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<style scoped></style>
