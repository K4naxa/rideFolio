<script setup lang="ts">
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogScrollContent from "@/components/ui/dialog/DialogScrollContent.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import { useModalStore } from "@/stores/modal";
import { RefillSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm, Field, ErrorMessage } from "vee-validate";
import { computed, watch } from "vue";
import { toast } from "vue-sonner";
import Input from "@/components/ui/input/Input.vue";
import Switch from "@/components/ui/switch/Switch.vue";
import HelpTooltip from "@/components/ui/HelpTooltip.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import DateInput from "@/components/forms/DateInput.vue";
import { useCurrentVehicle } from "@/lib/useCurrentVehicle";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Label from "@/components/ui/label/Label.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import Icons from "@/components/icons/Icon.vue";
import z from "zod";
import { useRefillCreate } from "@/lib/queries/refills/refill-mutations";

import { useSelectedVehicle } from "@/lib/composables/useSelectedVehicle";

const { currentVehicleId } = useCurrentVehicle();
const { handleSubmit, resetForm, isSubmitting, values, setFieldValue } = useForm({
  validationSchema: toTypedSchema(
    RefillSchema.extend({
      odometer: z.number().refine(
        async (value): Promise<boolean> => {
          if (!value) return true;

          if (!selectedVehicleLastRefillOdometer.value) return true;
          return selectedVehicleLastRefillOdometer.value < value;
        },
        {
          message: "Must be greater than last refill ",
        },
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

const { selectedVehicle, selectedVehicleLastRefillOdometer, selectedVehicleOdometerUnit } = useSelectedVehicle(
  values.vehicleId,
);

// FUNCTIONS FOR CALCULATION HANDLING
const handleFuelAmountChange = (value: string | number) => {
  const fuelAmount = typeof value === "string" ? parseFloat(value) : value;
  setFieldValue("fuelAmount", isNaN(fuelAmount) ? null : fuelAmount, true);

  const pricePerUnit = Number(values.pricePerUnit);

  if (!isNaN(fuelAmount) && pricePerUnit) {
    const total = parseFloat((fuelAmount * pricePerUnit).toFixed(2));
    setFieldValue("costTotal", total, true);
  }
};

const handlePricePerUnitChange = (value: string | number) => {
  const pricePerUnit = typeof value === "string" ? parseFloat(value) : value;
  setFieldValue("pricePerUnit", isNaN(pricePerUnit) ? null : pricePerUnit, true);

  const fuelAmount = Number(values.fuelAmount);

  if (!isNaN(pricePerUnit) && fuelAmount) {
    const total = parseFloat((fuelAmount * pricePerUnit).toFixed(2));
    setFieldValue("costTotal", total, true);
  }
};

const handleCostTotalChange = (value: string | number) => {
  const totalCost = typeof value === "string" ? parseFloat(value) : value;
  setFieldValue("costTotal", isNaN(totalCost) ? null : totalCost, true);

  const fuelAmount = Number(values.fuelAmount);

  // Avoid division by zero and only calculate if fuelAmount is present
  if (!isNaN(totalCost) && fuelAmount && fuelAmount > 0) {
    const price = parseFloat((totalCost / fuelAmount).toFixed(3));
    setFieldValue("pricePerUnit", price, true);
  }
};

const { mutateAsync: createRefill } = useRefillCreate();
const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createRefill");
const handleClose = () => {
  modalStore.onClose();
};

const onSubmit = handleSubmit(async (values) => {
  createRefill(values, {
    onSuccess: () => {
      toast.success("Refill created succesfully");
      handleClose();
    },
  });
});

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
  <Dialog :open="isModalOpen" @update:open="handleClose">
    <DialogScrollContent class="w-full max-w-xl" key="CreateRefillModal">
      <DialogHeader>
        <DialogTitle>
          <Icons name="refill" />
          Create new refill
        </DialogTitle>
        <DialogDescription class="text-start">Log a new fuel refill for your vehicle</DialogDescription>
      </DialogHeader>
      <form @submit.prevent="onSubmit" class="flex flex-col justify-between gap-6" data-cy="create-refill-form">
        <div class="flex flex-col gap-6">
          <Field v-slot="{ value, handleChange }" name="vehicleId">
            <div>
              <VehicleSelect
                :value="value"
                @valueChange="handleChange"
                placeholder="Select a vehicle"
                data-cy="vehicle-select"
              />
              <ErrorMessage name="vehicleId" class="text-destructive mt-1 ml-2 text-sm" data-cy="vehicle-error" />
            </div>
          </Field>

          <!-- Date & Odometer -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <DateInput name="date" :initial-value="new Date()" disableFuture data-cy="date-input" />
            <div class="relative pb-3">
              <Input
                name="odometer"
                type="number"
                placeholder="Odometer"
                :suffix="selectedVehicle?.vehicleData.odometerData.unit"
                data-cy="odometer-input"
              />
              <span
                v-if="selectedVehicleLastRefillOdometer"
                class="text-muted-foreground absolute -bottom-2 left-2 text-xs"
                >Last: {{ selectedVehicleLastRefillOdometer }} {{ selectedVehicleOdometerUnit }}</span
              >
            </div>
          </div>

          <!-- Fill Type -->
          <div class="grid grid-cols-2 gap-6">
            <Field v-slot="{ value, handleChange }" name="fullRefill">
              <Label
                class="text flex items-center gap-4 rounded border px-4 py-3 leading-none font-semibold select-none"
                data-cy="full-refill-switch"
              >
                <Switch :model-value="value" @update:model-value="handleChange" />
                <p>Full refill</p>
              </Label>
            </Field>
            <Field v-slot="{ value, handleChange }" name="skippedRefill">
              <label
                class="flex items-center space-x-2 rounded border px-4 py-3 font-semibold select-none"
                data-cy="skipped-refill-switch"
              >
                <Switch :model-value="value" @update:model-value="handleChange" />
                <p>Skipped refill</p>
                <HelpTooltip message="Was last refill not logged?" />
              </label>
            </Field>
          </div>

          <!-- Cost fields  -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Input
              name="fuelAmount"
              type="number"
              step="0.01"
              placeholder="Amount"
              :onValueChange="handleFuelAmountChange"
              data-cy="fuel-amount-input"
            />
            <Input
              name="pricePerUnit"
              type="number"
              step="0.001"
              placeholder="Unit Price"
              suffix="€"
              :onValueChange="handlePricePerUnitChange"
              data-cy="price-per-unit-input"
            />
            <Input
              name="costTotal"
              type="number"
              step="0.01"
              placeholder="Total cost"
              :onValueChange="handleCostTotalChange"
              data-cy="total-cost-input"
            />
          </div>

          <Textarea name="notes" placeholder="Refill notes.." data-cy="notes-input" />
        </div>

        <DialogFooter class="pt-auto">
          <Button type="submit" :disabled="isSubmitting" data-cy="submit-refill-btn">
            <span v-if="!isSubmitting">Create</span>
            <span v-else> <Spinner /> Creating.. </span>
          </Button>
          <Button type="button" variant="outline" @click="handleClose" data-cy="cancel-refill-btn">Cancel</Button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
