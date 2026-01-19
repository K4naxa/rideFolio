<script setup lang="ts">
import Separator from "@/components/ui/separator/Separator.vue";
import {
  consumptionUnits_distance,
  consumptionUnits_hour,
  CURRENCIES,
  getConsumptionUnitNamekey,
  getCurrencyName,
  getCurrencySymbol,
  getVolumeUnitNamekey,
  VOLUME_UNITS,
} from "@repo/validation";
import { computed } from "vue";
import { useUserPreferenceUpdate } from "@/lib/queries/user/user-mutations";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import ResponsiveSelect, { type ResponsiveSelectOption } from "@/components/forms/ResponsiveSelect.vue";

const { currentUser } = useCurrentUser();
console.log("Current User Preferences:", currentUser.value?.preferences);

const { mutateAsync: updatePreference } = useUserPreferenceUpdate();

const volumeUnitsArray = computed<ResponsiveSelectOption<string>[]>(() =>
  Object.values(VOLUME_UNITS).map((unit) => ({
    value: unit.code,
    label: getVolumeUnitNamekey(unit.code),
  })),
);
const currencyOptionsArray = computed<ResponsiveSelectOption<string>[]>(() =>
  Object.values(CURRENCIES).map((currency) => ({
    value: currency.code,
    label: getCurrencyName(currency.code),
    symbol: getCurrencySymbol(currency.code),
  })),
);
const consumptionUnitsDistance = consumptionUnits_distance.map((unit) => {
  return {
    value: unit.code,
    label: getConsumptionUnitNamekey(unit.code),
  };
});

const consumptionUnitsHour = consumptionUnits_hour.map((unit) => {
  return {
    value: unit.code,
    label: getConsumptionUnitNamekey(unit.code),
  };
});
</script>

<template>
  <!-- Nav bar -->

  <h1>User Preferences</h1>
  <span class="text-muted-foreground">Manage your user preferences here.</span>

  <Separator class="mt-2 mb-6" />

  <div class="space-y-10 px-0!">
    <!-- Preferred units -->
    <div class="space-y-2">
      <h2 class="text-muted-foreground">Preferred Units</h2>
      <div class="flex items-center justify-between gap-6">
        <p>Fuel volume unit:</p>
        <ResponsiveSelect
          :options="volumeUnitsArray"
          :modelValue="currentUser?.preferences.volumeUnit"
          placeholder="Select Volume unit"
          title="Volume Unit"
          description="Choose your preferred unit for volume measurements"
          triggerClass="w-50"
          @select="(value) => updatePreference({ key: 'volumeUnit', value })"
        />
      </div>
      <div class="flex justify-between gap-6">
        <p>Currency:</p>
        <ResponsiveSelect
          :options="currencyOptionsArray"
          :modelValue="currentUser?.preferences.currency"
          placeholder="Select Currency"
          title="Currency"
          description="Choose your preferred currency"
          triggerClass="w-50"
          @select="(value) => updatePreference({ key: 'currency', value })"
        />
      </div>
    </div>

    <!-- Preferred consumption units -->
    <div class="space-y-2">
      <h2 class="text-muted-foreground">Consumption units</h2>
      <div class="flex items-center justify-between gap-6">
        <p>Distance odometer:</p>
        <ResponsiveSelect
          :options="consumptionUnitsDistance"
          :modelValue="currentUser?.preferences.consumptionUnitCode_distance"
          @select="(value) => updatePreference({ key: 'consumptionUnitCode_distance', value })"
          placeholder="Select Consumption Unit"
          title="Consumption Unit"
          triggerClass="w-50"
        />
      </div>

      <div class="flex items-center justify-between gap-6">
        <p>Hourly odometer:</p>

        <ResponsiveSelect
          :options="consumptionUnitsHour"
          :modelValue="currentUser?.preferences.consumptionUnitCode_hour"
          @select="(value) => updatePreference({ key: 'consumptionUnitCode_hour', value })"
          placeholder="Select Consumption Unit"
          title="Consumption Unit"
          triggerClass="w-50"
        />
      </div>
    </div>
  </div>
</template>
