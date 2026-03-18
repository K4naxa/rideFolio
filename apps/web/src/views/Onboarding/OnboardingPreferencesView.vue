<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ChevronRight } from "lucide-vue-next";

import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardFooter from "@/components/ui/card/CardFooter.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import Label from "@/components/ui/label/Label.vue";
import ResponsiveSelect from "@/components/forms/ResponsiveSelect.vue";

import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useUserPreferenceUpdate } from "@/lib/queries/user/user-mutations";

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

const router = useRouter();
const { currentUser } = useCurrentUser();
const { mutateAsync: updatePreference } = useUserPreferenceUpdate();

const volumeUnits = computed(() =>
  Object.values(VOLUME_UNITS).map((unit) => ({
    value: unit.code,
    label: getVolumeUnitNamekey(unit.code),
  })),
);

const currencies = computed(() =>
  Object.values(CURRENCIES).map((currency) => ({
    value: currency.code,
    label: `${getCurrencyName(currency.code)} (${getCurrencySymbol(currency.code)})`,
  })),
);

const distanceConsumptionUnits = consumptionUnits_distance.map((unit) => ({
  value: unit.code,
  label: getConsumptionUnitNamekey(unit.code),
}));

const hourlyConsumptionUnits = consumptionUnits_hour.map((unit) => ({
  value: unit.code,
  label: getConsumptionUnitNamekey(unit.code),
}));

function handlePreferenceChange(key: string, value: string) {
  updatePreference({ key: key as never, value });
}

function goToVehicleStep() {
  router.push({ name: "onboarding-add-vehicle" });
}

function skipOnboarding() {
  router.push({ name: "Dashboard" });
}
</script>

<template>
  <Card class="mx-auto w-full max-w-lg overflow-hidden transition-all duration-300">
    <CardHeader>
      <CardTitle class="text-2xl">Welcome to RideFolio!</CardTitle>
      <CardDescription>Let's personalize your experience by setting up your preferred units.</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-6">
      <div class="space-y-4">
        <h3 class="text-muted-foreground flex items-center gap-2 text-sm font-medium tracking-wide uppercase">Units</h3>
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label>Fuel Volume</Label>
            <ResponsiveSelect
              :options="volumeUnits"
              :modelValue="currentUser?.preferences.volumeUnit"
              @select="(v) => handlePreferenceChange('volumeUnit', v)"
              placeholder="Select unit"
              title="Fuel volume unit"
              description="Used when creating refills and effects consumption calculations"
              triggerClass="w-full"
            />
          </div>

          <div class="grid gap-2">
            <Label>Distance consumption</Label>
            <ResponsiveSelect
              :options="distanceConsumptionUnits"
              :modelValue="currentUser?.preferences.consumptionUnitCode_distance"
              @select="(v) => handlePreferenceChange('consumptionUnitCode_distance', v)"
              placeholder="Select unit"
              title="Distance consumption units"
              description="Used to display consumption values inside the app"
              triggerClass="w-full"
            />
          </div>

          <div class="grid gap-2">
            <Label>Hourly consumption</Label>
            <ResponsiveSelect
              :options="hourlyConsumptionUnits"
              :modelValue="currentUser?.preferences.consumptionUnitCode_hour"
              @select="(v) => handlePreferenceChange('consumptionUnitCode_hour', v)"
              placeholder="Select unit"
              title="Hourly consumption units"
              description="Used to display consumption values inside the app"
              triggerClass="w-full"
            />
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-muted-foreground flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
          Region
        </h3>
        <div class="grid gap-2">
          <Label>Currency</Label>
          <ResponsiveSelect
            :options="currencies"
            :modelValue="currentUser?.preferences.currency"
            @select="(v) => handlePreferenceChange('currency', v)"
            placeholder="Select currency"
            title="Currency"
            triggerClass="w-full"
          />
        </div>
      </div>
    </CardContent>
    <CardFooter class="flex justify-between">
      <Button variant="outline" @click="skipOnboarding">Skip Setup</Button>
      <Button @click="goToVehicleStep" class="group">
        Next <ChevronRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </CardFooter>
  </Card>
</template>
