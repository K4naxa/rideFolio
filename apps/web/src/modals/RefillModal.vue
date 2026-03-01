<script setup lang="ts">
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import { useModalStore } from "@/stores/modal";
import { RefillSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed, watch } from "vue";
import { toast } from "vue-sonner";
import Input from "@/components/ui/input/Input.vue";
import Switch from "@/components/ui/switch/Switch.vue";
import HelpTooltip from "@/components/ui/HelpTooltip.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Label from "@/components/ui/label/Label.vue";
import z from "zod";
import { useRefillCreate } from "@/lib/queries/refills/refill-mutations";
import { useSelectedVehicle } from "@/lib/composables/useSelectedVehicle";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import FormDateInput from "@/components/forms/FormDateInput.vue";

const { currentVehicleId } = useCurrentVehicle();
const { preferredCurrencySymbol, preferredVolumeUnit } = useCurrentUser();

const { mutateAsync: createRefill } = useRefillCreate();
const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createRefill");
const handleClose = () => modalStore.onClose();

const { selectedVehicle, selectedVehicleLastRefillOdometer, selectedVehicleOdometerUnit } = useSelectedVehicle(
  computed(() => values.vehicleId),
);

const { handleSubmit, resetForm, isSubmitting, values, setFieldValue } = useForm({
  validationSchema: toTypedSchema(
    RefillSchema.extend({
      odometer: z.number().refine(
        async (value): Promise<boolean> => {
          if (!value) return true;
          if (!selectedVehicleLastRefillOdometer.value) return true;
          return selectedVehicleLastRefillOdometer.value < value;
        },
        { message: "Must be greater than last refill " },
      ),
    }),
  ),
  initialValues: {
    fullRefill: true,
    skippedRefill: false,
    date: new Date(),
    vehicleId: currentVehicleId.value,
  },
});

const onSubmit = handleSubmit(async (values) => {
  createRefill(values, {
    onSuccess: () => {
      toast.success("Refill created succesfully");
      handleClose();
    },
  });
});

// FUNCTIONS FOR CALCULATION HANDLING
const handleFuelAmountChange = (value: string | number) => {
  const fuelAmount = typeof value === "string" ? parseFloat(value) : value;
  setFieldValue("fuelAmount", isNaN(fuelAmount) ? null : fuelAmount, true);
  const pricePerUnit = Number(values.pricePerUnit);
  if (!isNaN(fuelAmount) && pricePerUnit) {
    setFieldValue("costTotal", parseFloat((fuelAmount * pricePerUnit).toFixed(2)), true);
  }
};

const handlePricePerUnitChange = (value: string | number) => {
  const pricePerUnit = typeof value === "string" ? parseFloat(value) : value;
  setFieldValue("pricePerUnit", isNaN(pricePerUnit) ? null : pricePerUnit, true);
  const fuelAmount = Number(values.fuelAmount);
  if (!isNaN(pricePerUnit) && fuelAmount) {
    setFieldValue("costTotal", parseFloat((fuelAmount * pricePerUnit).toFixed(2)), true);
  }
};

const handleCostTotalChange = (value: string | number) => {
  const totalCost = typeof value === "string" ? parseFloat(value) : value;
  setFieldValue("costTotal", isNaN(totalCost) ? null : totalCost, true);
  const fuelAmount = Number(values.fuelAmount);
  if (!isNaN(totalCost) && fuelAmount && fuelAmount > 0) {
    setFieldValue("pricePerUnit", parseFloat((totalCost / fuelAmount).toFixed(3)), true);
  }
};

watch(isModalOpen, (open) => {
  if (open && currentVehicleId.value) {
    resetForm({
      values: {
        ...values,
        vehicleId: currentVehicleId.value,
        date: new Date(),
        fullRefill: true,
        skippedRefill: false,
      },
    });
  }
});
</script>

<template>
  <ResponsiveFormDialog
    :open="isModalOpen"
    @close="handleClose"
    title="New Refill"
    description="Log a fuel refill for your vehicle."
    icon="refill"
    content-class="max-w-xl"
    key="CreateRefillModal"
  >
    <form data-cy="create-refill-form" class="contents">
      <!-- Vehicle -->
      <Field v-slot="{ value, handleChange }" name="vehicleId">
        <div>
          <VehicleSelect
            :value="value"
            @valueChange="handleChange"
            placeholder="Select a vehicle"
            data-cy="vehicle-select"
            :description="'Select from vehicles you have access to.'"
          />
          <ErrorMessage name="vehicleId" class="text-destructive mt-1 ml-2 text-sm" data-cy="vehicle-error" />
        </div>
      </Field>

      <!-- Date & Odometer -->
      <div class="grid gap-3 sm:grid-cols-2">
        <FormDateInput name="date" label="Date" :initial-value="new Date()" disableFuture data-cy="date-input" />
        <div class="relative">
          <Input
            name="odometer"
            type="number"
            label="Odometer"
            placeholder="Current reading"
            :suffix="selectedVehicle?.vehicleData.odometerData.unit"
            data-cy="odometer-input"
          />
          <span
            v-if="selectedVehicleLastRefillOdometer"
            class="text-muted-foreground absolute -bottom-4 left-2 text-xs"
          >
            Last: {{ selectedVehicleLastRefillOdometer }} {{ selectedVehicleOdometerUnit }}
          </span>
        </div>
      </div>

      <!-- Fill Type -->
      <div class="grid grid-cols-2 gap-3">
        <Field v-slot="{ value, handleChange }" name="fullRefill">
          <Label
            class="flex items-center gap-3 rounded border px-3 py-3 leading-none select-none"
            data-cy="full-refill-switch"
          >
            <Switch :model-value="value" @update:model-value="handleChange" />
            <p class="text-sm font-medium">Full refill</p>
          </Label>
        </Field>
        <Field v-slot="{ value, handleChange }" name="skippedRefill">
          <label class="flex items-center gap-3 rounded border px-3 py-3 select-none" data-cy="skipped-refill-switch">
            <Switch :model-value="value" @update:model-value="handleChange" />
            <p class="text-sm font-medium">Skipped</p>
            <HelpTooltip message="Was last refill not logged?" />
          </label>
        </Field>
      </div>

      <!-- Cost breakdown -->
      <div class="flex flex-col gap-1">
        <p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Cost breakdown</p>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Input
            name="fuelAmount"
            type="number"
            step="0.01"
            label="Amount"
            :suffix="preferredVolumeUnit"
            placeholder="0.00"
            :onValueChange="handleFuelAmountChange"
            data-cy="fuel-amount-input"
            class="col-span-2 md:col-span-1"
          />
          <Input
            name="pricePerUnit"
            type="number"
            step="0.001"
            label="Unit price"
            placeholder="0.000"
            :suffix="preferredCurrencySymbol"
            :onValueChange="handlePricePerUnitChange"
            data-cy="price-per-unit-input"
          />
          <Input
            name="costTotal"
            type="number"
            step="0.01"
            label="Total cost"
            placeholder="0.00"
            :suffix="preferredCurrencySymbol"
            :onValueChange="handleCostTotalChange"
            data-cy="total-cost-input"
          />
        </div>
      </div>

      <Textarea name="notes" label="Notes" placeholder="Optional notes about this refill…" data-cy="notes-input" />
    </form>

    <template #footer>
      <Button type="button" @click="onSubmit" :disabled="isSubmitting" data-cy="submit-refill-btn">
        <Spinner v-if="isSubmitting" class="mr-1" />
        {{ isSubmitting ? "Creating…" : "Create refill" }}
      </Button>
      <Button type="button" variant="outline" @click="handleClose" data-cy="cancel-refill-btn">Cancel</Button>
    </template>
  </ResponsiveFormDialog>
</template>
