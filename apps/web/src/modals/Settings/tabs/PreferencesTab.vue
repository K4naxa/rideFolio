<script setup lang="ts">
import ResponsiveSelect, { type ResponsiveSelectOption } from "@/components/forms/ResponsiveSelect.vue";
import Button from "@/components/ui/button/Button.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Label from "@/components/ui/label/Label.vue";
import Separator from "@/components/ui/separator/Separator.vue";

import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useUserPreferenceUpdate } from "@/lib/queries/user/user-mutations";

import { useThemeStore, type ThemeType } from "@/stores/theme";
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

const { currentUser } = useCurrentUser();
const themeStore = useThemeStore();

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

function handleThemeChange(value: ThemeType) {
  themeStore.setTheme(value as typeof themeStore.theme);
}
</script>

<template>
  <div class="flex flex-col">
    <DialogHeader class="hidden">
      <DialogTitle>Preference settings</DialogTitle>
      <DialogDescription> Manage your preference settings such as units and theme. </DialogDescription>
    </DialogHeader>

    <div class="space-y-10">
      <div>
        <header class="mb-4">
          <h3>Preferences</h3>
          <Separator class="my-2" />
        </header>

        <div class="flex items-center justify-between gap-4">
          <div>
            <Label> Theme </Label>
            <span class="text-muted-foreground text-sm">Used for application appearance</span>
          </div>

          <ResponsiveSelect
            :options="[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]"
            :modelValue="themeStore.theme"
            @select="handleThemeChange"
            placeholder="Select Theme"
            title="Theme"
            triggerClass="w-40 md:w-50"
          />
        </div>
      </div>

      <div class="space-y-6">
        <header class="mb-4">
          <h3>Units</h3>
          <Separator class="my-2" />
        </header>

        <div class="flex items-center justify-between gap-6">
          <div>
            <Label>Fuel volume unit</Label>
            <span class="text-muted-foreground text-sm"> Used in fuel logs and statistics </span>
          </div>
          <ResponsiveSelect
            :options="volumeUnitsArray"
            :modelValue="currentUser?.preferences.volumeUnit"
            placeholder="Select Volume unit"
            title="Volume Unit"
            description="Choose your preferred unit for volume measurements"
            triggerClass="w-40 md:w-50"
            @select="(value) => updatePreference({ key: 'volumeUnit', value })"
          />
        </div>
        <div class="flex justify-between gap-6">
          <div>
            <Label>Currency</Label>
            <span class="text-muted-foreground text-sm">Used for visual representation only</span>
          </div>
          <ResponsiveSelect
            :options="currencyOptionsArray"
            :modelValue="currentUser?.preferences.currency"
            placeholder="Select Currency"
            title="Currency"
            description="Choose your preferred currency (visual only)"
            triggerClass="w-40 md:w-50"
            @select="(value) => updatePreference({ key: 'currency', value })"
          />
        </div>
      </div>

      <div class="space-y-6">
        <header class="mb-4">
          <h3>Consumption units</h3>
          <Separator class="my-2" />
        </header>

        <div class="flex items-center justify-between gap-6">
          <div>
            <Label>Distance odometer</Label>
            <span class="text-muted-foreground text-sm">Choose your preferred consumption unit for distance</span>
          </div>
          <ResponsiveSelect
            :options="consumptionUnitsDistance"
            :modelValue="currentUser?.preferences.consumptionUnitCode_distance"
            @select="(value) => updatePreference({ key: 'consumptionUnitCode_distance', value })"
            placeholder="Select Consumption Unit"
            title="Consumption Unit"
            triggerClass="w-40 md:w-50"
          />
        </div>
        <div class="flex items-center justify-between gap-6">
          <div>
            <Label>Hourly odometer</Label>
            <span class="text-muted-foreground text-sm">preferred consumption unit for hourly measurements</span>
          </div>
          <ResponsiveSelect
            :options="consumptionUnitsHour"
            :modelValue="currentUser?.preferences.consumptionUnitCode_hour"
            @select="(value) => updatePreference({ key: 'consumptionUnitCode_hour', value })"
            placeholder="Select Consumption Unit"
            title="Consumption Unit"
            triggerClass="w-40 md:w-50"
          />
        </div>
      </div>
    </div>
  </div>
</template>
