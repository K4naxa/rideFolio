<script setup lang="ts">
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import Icon from "@/components/icons/Icon.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import VehicleAvatar from "@/components/vehicles/VehicleAvatar.vue";
import { useVehicleDetailsQuery } from "@/lib/queries/vehicles/vehicle-queries.ts";
import { formatBytesToMB } from "@/lib/utils.ts";
import { FUEL_TYPES, type FuelTypeCode, getOdometerUnit } from "@repo/validation";
import { computed } from "vue";
import { useUserQuery } from "@/lib/queries/user/user-queries.ts";
import { getCurrencySymbol } from "@repo/validation";
import { useModalStore } from "@/stores/modal.ts";

const modalStore = useModalStore();

const isOpen = computed(() => modalStore.isOpen && modalStore.type === "vehicleDetails");
const vehicleId = computed(() => (isOpen.value ? modalStore.itemId : undefined));

function handleOpenChange(value: boolean) {
  if (!value) modalStore.onClose();
}

const { data: details, isLoading } = useVehicleDetailsQuery(vehicleId);

const { data: user } = useUserQuery();

const currencySymbol = computed(() => getCurrencySymbol(user.value?.preferences.currency ?? "EUR"));

const vehicle = computed(() => details.value?.vehicle);
const odometerUnit = computed(() => getOdometerUnit(vehicle.value?.odometerData.type));

const formattedDate = computed(() => {
  if (!details.value?.createdAt) return "";
  return new Date(details.value.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const storageItems = computed(() => {
  if (!details.value) return [];
  const s = details.value.storage;
  return [
    { label: "Vehicle data", bytes: s.vehicleBytes },
    { label: "Refills", bytes: s.refillBytes },
    { label: "Maintenances", bytes: s.maintenanceBytes },
    { label: "To-dos", bytes: s.todoBytes },
    { label: "Notes", bytes: s.noteBytes },
    { label: "Shopping list", bytes: s.shoppingBytes },
  ].filter((item) => item.bytes > 0);
});

const totalStorageMB = computed(() => formatBytesToMB(details.value?.storage.totalBytes));

const totalEntries = computed(() => {
  if (!details.value) return 0;
  const c = details.value.counts;
  return c.refills + c.maintenances + c.todos + c.notes + c.shoppingItems;
});
</script>

<template>
  <ResponsiveFormDialog
    :open="isOpen"
    @update:open="handleOpenChange"
    title="Vehicle Details"
    content-class="max-w-xl"
  >
    <!-- Loading state -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center gap-3 py-12">
      <div class="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      <span class="text-muted-foreground text-sm">Loading details...</span>
    </div>

    <template v-else-if="details">
      <!-- Vehicle Identity -->
      <div class="flex items-start gap-4">
        <VehicleAvatar
          :src="vehicle?.image"
          :type="vehicle?.type.code"
          class="h-20 w-28 shrink-0 rounded-lg"
        />
        <div class="flex min-w-0 flex-col gap-1.5">
          <h3 class="truncate text-lg font-medium leading-tight">{{ vehicle?.name }}</h3>
          <div class="flex flex-wrap items-center gap-1.5">
            <Badge v-if="vehicle?.make" class="bg-muted text-foreground rounded-md text-xs font-normal">
              {{ vehicle.make }}
            </Badge>
            <Badge v-if="vehicle?.model" class="bg-muted text-foreground rounded-md text-xs font-normal">
              {{ vehicle.model }}
            </Badge>
            <Badge v-if="vehicle?.year" class="bg-muted text-foreground rounded-md text-xs font-normal">
              {{ vehicle.year }}
            </Badge>
          </div>
          <span class="text-muted-foreground text-xs">
            Owned by {{ details.owner.name }}
          </span>
        </div>
      </div>

      <Separator />

      <!-- Vehicle Information -->
      <section class="flex flex-col gap-3">
        <h4 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Information</h4>
        <div class="grid grid-cols-2 gap-x-6 gap-y-2.5">
          <DetailRow label="Type" :value="vehicle?.type.nameKey?.split('.').pop() ?? ''" />
          <DetailRow label="Fuel type" :value="FUEL_TYPES[vehicle?.fuelType as FuelTypeCode]?.label ?? ''" />
          <DetailRow v-if="vehicle?.licensePlate" label="License plate" :value="vehicle.licensePlate" />
          <DetailRow v-if="vehicle?.vin" label="VIN" :value="vehicle.vin" />
          <DetailRow label="Odometer type" :value="vehicle?.odometerData.type ?? ''" />
          <DetailRow
            label="Current reading"
            :value="
              vehicle?.odometerData.value != null
                ? `${vehicle.odometerData.value.toLocaleString()} ${odometerUnit}`
                : 'Not set'
            "
          />
          <DetailRow label="Added" :value="formattedDate" />
        </div>
      </section>

      <Separator />

      <!-- Lifetime Stats -->
      <section class="flex flex-col gap-3">
        <h4 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Lifetime Stats</h4>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            icon="refill"
            :value="details.counts.refills"
            label="Refills"
          />
          <StatCard
            icon="maintenance"
            :value="details.counts.maintenances"
            label="Maintenances"
          />
          <StatCard
            icon="todo"
            :value="details.counts.todos"
            label="To-dos"
          />
          <StatCard
            icon="notes"
            :value="details.counts.notes"
            label="Notes"
          />
          <StatCard
            icon="shoppingCart"
            :value="details.counts.shoppingItems"
            label="Shopping items"
          />
          <StatCard
            icon="stats"
            :value="totalEntries"
            label="Total entries"
          />
        </div>
      </section>

      <!-- Fuel & Cost Summary -->
      <section
        v-if="details.lifetimeStats.totalFuelConsumed || details.lifetimeStats.totalCost || details.lifetimeStats.totalTrackedDistance || details.lifetimeStats.totalTrackedHours"
        class="flex flex-col gap-3"
      >
        <h4 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Consumption & Cost</h4>
        <div class="grid grid-cols-2 gap-x-6 gap-y-2.5">
          <DetailRow
            v-if="details.lifetimeStats.totalFuelConsumed"
            label="Total fuel"
            :value="`${details.lifetimeStats.totalFuelConsumed.toLocaleString(undefined, { maximumFractionDigits: 1 })} L`"
          />
          <DetailRow
            v-if="details.lifetimeStats.totalCost"
            label="Total cost"
            :value="`${currencySymbol}${details.lifetimeStats.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}`"
          />
          <DetailRow
            v-if="details.lifetimeStats.totalTrackedDistance"
            label="Distance tracked"
            :value="`${details.lifetimeStats.totalTrackedDistance.toLocaleString(undefined, { maximumFractionDigits: 0 })} km`"
          />
          <DetailRow
            v-if="details.lifetimeStats.totalTrackedHours"
            label="Hours tracked"
            :value="`${details.lifetimeStats.totalTrackedHours.toLocaleString(undefined, { maximumFractionDigits: 1 })} h`"
          />
        </div>
      </section>

      <Separator />

      <!-- Storage -->
      <section class="flex flex-col gap-3">
        <div class="flex items-baseline justify-between">
          <h4 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Cloud Storage</h4>
          <span class="text-foreground text-sm font-medium tabular-nums">{{ totalStorageMB }} MB</span>
        </div>

        <!-- Storage bar -->
        <div class="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            class="bg-primary h-full rounded-full transition-all duration-500"
            :style="{ width: details.storage.totalBytes > 0 ? '100%' : '0%' }"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <div
            v-for="item in storageItems"
            :key="item.label"
            class="text-muted-foreground flex items-center justify-between text-xs"
          >
            <span>{{ item.label }}</span>
            <span class="tabular-nums">{{ formatBytesToMB(item.bytes) }} MB</span>
          </div>
        </div>
      </section>
    </template>
  </ResponsiveFormDialog>
</template>

<!-- DetailRow sub-component -->
<script lang="ts">
import { defineComponent, h } from "vue";

const DetailRow = defineComponent({
  name: "DetailRow",
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  setup(props) {
    return () =>
      h("div", { class: "flex flex-col gap-0.5" }, [
        h("span", { class: "text-muted-foreground text-xs" }, props.label),
        h("span", { class: "text-foreground text-sm font-medium" }, props.value || "\u2014"),
      ]);
  },
});

const StatCard = defineComponent({
  name: "StatCard",
  props: {
    icon: { type: String, required: true },
    value: { type: Number, required: true },
    label: { type: String, required: true },
  },
  setup(props) {
    return () =>
      h(
        "div",
        { class: "bg-muted/50 flex items-center gap-3 rounded-lg px-3 py-2.5" },
        [
          h(Icon, { name: props.icon as any, size: "sm", class: "text-muted-foreground shrink-0" }),
          h("div", { class: "flex flex-col" }, [
            h("span", { class: "text-foreground text-base font-medium tabular-nums leading-tight" }, String(props.value)),
            h("span", { class: "text-muted-foreground text-xs leading-tight" }, props.label),
          ]),
        ],
      );
  },
});
</script>
