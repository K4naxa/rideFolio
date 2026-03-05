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
import { useIsMobile } from "@/lib/composables/useMediaQuery.ts";
import MobilePageHeader from "@/Layouts/AuthLayout/components/MobilePageHeader.vue";
import ScrollableNav from "@/components/ui/ScrollableNav.vue";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/lib/composables/useCurrentUser.ts";
import { useVehicles } from "@/lib/composables/useVehicles.ts";

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

const user = useCurrentUser();
const { getVehicleNameById } = useVehicles();
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

// ─── Event type visual config ─────────────────────────────────────────────────

const typeConfig = {
  refill: {
    icon: "refill" as const,
    label: "Fuel Refill",
    iconClass: "text-refill",
    bgClass: "bg-refill/10 dark:bg-refill/15",
    accentClass: "border-l-refill",
    badgeClass: "bg-refill/10 text-refill",
  },
  maintenance: {
    icon: "maintenance" as const,
    label: "Maintenance",
    iconClass: "text-maintenance",
    bgClass: "bg-maintenance/10 dark:bg-maintenance/15",
    accentClass: "border-l-maintenance",
    badgeClass: "bg-maintenance/10 text-maintenance",
  },
  "todo-created": {
    icon: "todo" as const,
    label: "Task Created",
    iconClass: "text-todo",
    bgClass: "bg-todo/10 dark:bg-todo-500/15",
    accentClass: "border-l-todo",
    badgeClass: "bg-todo/10 text-todo",
  },
  "todo-completed": {
    icon: "circleCheck" as const,
    label: "Task Completed",
    iconClass: "text-success",
    bgClass: "bg-success/10 dark:bg-success/15",
    accentClass: "border-l-success",
    badgeClass: "bg-success/10 text-success",
  },
} as const;

const isMobile = useIsMobile();
</script>

<template>
  <MainContentWrapper class="flex flex-1 flex-col lg:pt-20">
    <!-- ── Header ──────────────────────────────────────────────── -->
    <template #mobile-header>
      <MobilePageHeader class="flex justify-between gap-4">
        <h1>Timeline</h1>
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
      </MobilePageHeader>
    </template>

    <header class="mb-4 hidden md:block"><h1>Timeline</h1></header>

    <!-- controls -->
    <div class="mb-4 flex items-center gap-4">
      <ScrollableNav class="scrollbar-none flex justify-between gap-8">
        <div class="flex items-center gap-2 overflow-x-auto">
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
      </ScrollableNav>
      <div v-if="!isMobile" class="ml-auto flex items-center gap-2">
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
        From {{ new Date(filters.startDate).toLocaleDateString() }}
      </Badge>
      <Badge v-if="filters.endDate" variant="secondary" class="gap-1">
        <Icon name="calendar" size="sm" />
        To {{ new Date(filters.endDate).toLocaleDateString() }}
      </Badge>
    </div>

    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-200 ease-in"
      enter-from-class="opacity-0"
      leaveToClass="opacity-0"
      mode="out-in"
    >
      <!-- ── Loading skeletons ────────────────────────────────────── -->
      <div v-if="isLoading" key="loading" class="flex flex-col">
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
      <div
        v-else-if="allItems.length === 0"
        key="empty"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
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
      <div v-else class="flex flex-col" key="timeline">
        <template v-for="([dateGroup, groupItems], groupIdx) in groupedItems" :key="dateGroup">
          <!-- Date-group divider -->
          <div
            :class="
              twMerge(
                'from-background mobileOffScreenScroll sticky top-(--app-header-height) z-10 mb-4 flex items-center gap-3 bg-linear-to-b to-transparent py-1 backdrop-blur-sm',
                groupIdx > 0 && 'mt-8',
              )
            "
          >
            <span class="text-muted-foreground shrink-0 text-xs font-semibold tracking-widest uppercase">
              {{ dateGroup }}
            </span>
            <div class="bg-border h-px flex-1" />
          </div>

          <!-- Items -->
          <TransitionGroup
            enterActiveClass="transition-all duration-300 ease-out "
            leaveActiveClass="transition-all duration-100 hidden"
            enterFromClass="opacity-0 "
            leaveToClass="opacity-0 translate-x-20"
            move-class="transition-all duration-200 ease-out "
          >
            <div v-for="(item, itemIdx) in groupItems" :key="`${item.type}-${item.data.id}`" class="flex gap-4">
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
                  :class="
                    twMerge('mt-1 w-px flex-1', itemIdx === groupItems.length - 1 ? 'bg-transparent' : 'bg-border')
                  "
                  style="min-height: 1.5rem"
                />
              </div>

              <!-- Content card -->
              <div
                class="card cardHover mb-4 min-w-0 flex-1 overflow-hidden rounded border border-l-2"
                :class="typeConfig[item.type].accentClass"
              >
                <!-- ── Refill ── -->
                <template v-if="item.type === 'refill'">
                  <div class="flex items-start gap-3 border-b px-3 py-2">
                    <Badge :class="typeConfig['refill'].badgeClass" class="font-medium"> Fuel Refill</Badge>
                    <div class="ml-auto flex items-center gap-4">
                      <Badge v-if="!filters.vehicleId" variant="accent">
                        {{ getVehicleNameById(item.data.vehicleId) }}
                      </Badge>
                      <span class="text-muted-foreground flex shrink-0 items-center gap-2 text-sm">
                        <Icon name="calendar" size="sm" />
                        {{ new Date(item.timestamp).toLocaleDateString() }}
                      </span>
                    </div>
                  </div>
                  <!--    Info -->
                  <div class="infoSectionWrapper">
                    <div class="flex flex-col">
                      <Label class="text-xs"><Icon name="refill" size="sm" /> Amount</Label>
                      <span>
                        <span class="text-card-foreground font-medium">{{ item.data.fuelVolume.value }}</span>
                        {{ item.data.fuelVolume.unit }}
                      </span>
                    </div>

                    <div class="flex flex-col">
                      <Label class="text-xs"> <Icon name="odoDistance" size="sm" /> Odometer</Label>
                      <span>
                        <span class="text-card-foreground font-medium"> {{ item.data.odometer.value }} </span>
                        {{ item.data.odometer.unit }}
                      </span>
                    </div>

                    <div v-if="item.data.costTotal" class="flex flex-col items-center">
                      <Label class="text-xs"> <Icon name="billing" size="sm" /> Cost </Label>
                      <span>
                        <span class="text-card-foreground font-medium">
                          {{ item.data.costTotal.toFixed(2) }}
                        </span>
                        {{ user.preferredCurrencySymbol }}
                      </span>
                    </div>
                  </div>
                  <p v-if="item.data.notes" class="text-muted-foreground mt-1.5 line-clamp-2 text-xs">
                    {{ item.data.notes }}
                  </p>
                </template>

                <!-- ── Maintenance ── -->
                <template v-else-if="item.type === 'maintenance'">
                  <div class="border-b px-3 py-2">
                    <div class="mb-2 flex items-start justify-between gap-3">
                      <Badge :class="typeConfig['maintenance'].badgeClass" class="font-medium">Maintenance</Badge>
                      <div class="ml-auto flex items-center gap-4">
                        <Badge v-if="!filters.vehicleId" variant="accent">
                          {{ getVehicleNameById(item.data.vehicleId) }}
                        </Badge>
                        <span class="text-muted-foreground flex shrink-0 items-center gap-2 text-sm">
                          <Icon name="calendar" size="sm" />
                          {{ new Date(item.timestamp).toLocaleDateString() }}
                        </span>
                      </div>
                    </div>

                    <p class="text-sm font-medium">{{ item.data.title }}</p>
                    <span class="text-muted-foreground text-sm">{{ item.data.notes }}</span>
                  </div>

                  <!--                  Parts -->
                  <div v-if="item.data.parts.length > 0" class="flex gap-2 border-b px-3 py-2">
                    <Label class="text-muted-foreground">Parts: </Label>
                    <Badge
                      variant="muted"
                      class="rounded-full font-medium"
                      v-for="part in item.data.parts"
                      :key="part.groupId"
                    >
                      {{ part.customName ?? part.partCode }}
                      <span v-if="part.locations.length" class="ml-1">
                        {{ part.locations.length }}
                      </span>
                    </Badge>
                  </div>

                  <!--    Info -->
                  <div class="infoSectionWrapper">
                    <div v-if="item.data.serviceProvider" class="flex flex-col">
                      <Label class="text-xs"> <Icon name="location" size="sm" /> Service</Label>
                      <span class="text-card-foreground">
                        {{ item.data.serviceProvider }}
                      </span>
                    </div>

                    <div class="flex flex-col">
                      <Label class="text-xs"><Icon name="odoDistance" size="sm" /> Odometer</Label>
                      <span>
                        <span class="text-card-foreground font-medium">
                          {{ item.data.odometerData.value }}
                        </span>
                        {{ item.data.odometerData.unit }}
                      </span>
                    </div>

                    <div v-if="item.data.costTotal" class="flex flex-col">
                      <Label class="text-xs"> <Icon name="billing" size="sm" /> Cost </Label>
                      <span class="text-card-foreground font-medium">
                        {{ item.data.costTotal.toFixed(2) }}
                      </span>
                    </div>
                  </div>
                </template>

                <!-- ── Todo Created ── -->
                <template v-else-if="item.type === 'todo-created'">
                  <div class="flex items-start justify-between gap-3 px-3 py-2">
                    <Badge :class="typeConfig['todo-created'].badgeClass" class="font-medium"> Task Created</Badge>
                    <div class="ml-auto flex items-center gap-4">
                      <Badge v-if="!filters.vehicleId" variant="accent">
                        {{ getVehicleNameById(item.data.vehicleId) }}
                      </Badge>
                      <span class="text-muted-foreground flex shrink-0 items-center gap-2 text-sm">
                        <Icon name="calendar" size="sm" />
                        {{ new Date(item.timestamp).toLocaleDateString() }}
                      </span>
                    </div>
                  </div>
                  <div class="space-y-1.5 px-3 pb-3">
                    <p class="text-sm font-medium">
                      {{ item.data.title }}
                    </p>
                    <p v-if="item.data.description" class="text-muted-foreground text-sm">
                      {{ item.data.description }}
                    </p>
                  </div>
                </template>

                <!-- ── Todo Completed ── -->
                <template v-else-if="item.type === 'todo-completed'">
                  <div class="flex items-start justify-between gap-3 px-3 py-2">
                    <Badge :class="typeConfig['todo-completed'].badgeClass" class="font-medium"> Task Completed</Badge>

                    <div class="ml-auto flex items-center gap-4">
                      <Badge v-if="!filters.vehicleId" variant="accent">
                        {{ getVehicleNameById(item.data.vehicleId) }}
                      </Badge>
                      <span class="text-muted-foreground flex shrink-0 items-center gap-2 text-sm">
                        <Icon name="calendar" size="sm" />
                        {{ new Date(item.timestamp).toLocaleDateString() }}
                      </span>
                    </div>
                  </div>
                  <div class="space-y-1.5 px-3 pb-3">
                    <p class="text-sm font-medium">
                      {{ item.data.title }}
                    </p>
                    <p v-if="item.data.description" class="text-muted-foreground text-sm">
                      {{ item.data.description }}
                    </p>
                  </div>
                </template>
              </div>
            </div>

            <!-- Load more / End indicator -->
            <div class="mt-4 flex justify-center pb-8" key="load-more">
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
          </TransitionGroup>
        </template>
      </div>
    </Transition>
  </MainContentWrapper>
</template>

<style scoped>
@reference "@/assets/main.css";
.infoSectionWrapper {
  @apply text-muted-foreground bg-background-light flex flex-wrap gap-x-8 gap-y-1 px-3 py-2 text-sm md:justify-normal;
}
</style>
