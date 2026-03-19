<script setup lang="ts">
import FormVehicleSelect from "@/components/forms/FormVehicleSelect.vue";
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import { useModalStore } from "@/stores/modal";
import { RefillSchema } from "@repo/validation";
import { Field, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";
import Switch from "@/components/ui/switch/Switch.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useRefillCreate } from "@/lib/queries/refills/refill-mutations";
import { AxiosError } from "axios";
import { useSelectedVehicle } from "@/lib/composables/useSelectedVehicle";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import FormDateInput from "@/components/forms/FormDateInput.vue";
import Icon from "@/components/icons/Icon.vue";
import FormInput from "@/components/forms/FormInput.vue";
import FormError from "@/components/forms/FormError.vue";

const { currentVehicleId } = useCurrentVehicle();
const { preferredCurrencySymbol, preferredVolumeUnit } = useCurrentUser();

const { mutateAsync: createRefill } = useRefillCreate();
const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createRefill");
const handleClose = () => modalStore.onClose();

const { selectedVehicleLastRefillOdometer, selectedVehicleOdometerUnit } = useSelectedVehicle(
  computed(() => values.vehicleId),
);

const formError = ref<string | null>(null);

const { handleSubmit, resetForm, isSubmitting, values, setFieldValue, setFieldError } = useForm({
  validationSchema: RefillSchema,

  initialValues: {
    fullRefill: true,
    skippedRefill: false,
    date: new Date(),
    vehicleId: currentVehicleId.value,
  },
});

const onSubmit = handleSubmit(async (values) => {
  formError.value = null;
  await createRefill(values, {
    onSuccess: () => {
      toast.success("Refill created successfully");
      handleClose();
    },
    onError: (error) => {
      const data = (error as AxiosError<{ message?: string; field?: string }>).response?.data;
      if (data?.field === "odometer") {
        setFieldError("odometer", data.message);
      }
      formError.value = data?.message || "Something went wrong. Please try again.";
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
  if (open) {
    formError.value = null;
    if (currentVehicleId.value)
      resetForm({
        values: {
          ...values,
          vehicleId: currentVehicleId.value,
          date: new Date(),
          fullRefill: true,
          skippedRefill: false,
        },
      });
    else
      resetForm({
        values: {
          ...values,
          vehicleId: "",
          date: new Date(),
          fullRefill: true,
          skippedRefill: false,
        },
      });
  }
});

const odometerPlaceholder = computed(() => {
  if (!selectedVehicleLastRefillOdometer.value) return "0";
  return String(selectedVehicleLastRefillOdometer.value);
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
    <form data-cy="create-refill-form" class="gaps-md flex flex-col">
      <FormError :message="formError" />

      <!-- Vehicle -->
      <FormVehicleSelect name="vehicleId" placeholder="Select a vehicle" label="Vehicle" />

      <!-- Date & Odometer -->
      <div class="gaps-md grid sm:grid-cols-2">
        <FormDateInput name="date" label="Date" :initial-value="new Date()" disableFuture data-cy="date-input" />
        <FormInput
          name="odometer"
          type="number"
          label="Odometer"
          :placeholder="odometerPlaceholder"
          :suffix="selectedVehicleOdometerUnit"
          data-cy="odometer-input"
        />
      </div>

      <!-- Fill Type -->
      <div class="gaps-md grid grid-cols-2">
        <Field v-slot="{ value, handleChange }" name="fullRefill">
          <label class="bg-input flex h-10 items-center rounded border p-3 select-none" data-cy="full-refill-switch">
            <span class="flex items-center gap-2.5"> <Icon name="fullRefill" class="h-5" /> Full refill</span>
            <Switch class="ml-auto" :model-value="value" @update:model-value="handleChange" />
          </label>
        </Field>
        <Field v-slot="{ value, handleChange }" name="skippedRefill">
          <label
            for="skippedRefill"
            data-cy="skipped-refill-switch"
            class="bg-input flex h-10 items-center rounded border p-3 select-none"
          >
            <span class="flex items-center gap-2.5 text-sm">
              <Icon name="skipped" class="h-5 rotate-y-180" tooltip="Previous refill was not logged" /> Missed prev.
            </span>
            <Switch id="skippedRefill" class="ml-auto" :model-value="value" @update:model-value="handleChange" />
          </label>
        </Field>
      </div>

      <!-- Cost breakdown -->
      <div class="gaps-sm flex flex-col">
        <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
          <FormInput
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
          <FormInput
            name="pricePerUnit"
            type="number"
            step="0.001"
            label="Unit price"
            placeholder="0.000"
            :suffix="preferredCurrencySymbol"
            :onValueChange="handlePricePerUnitChange"
            data-cy="price-per-unit-input"
          />
          <FormInput
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
