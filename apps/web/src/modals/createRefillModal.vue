<script setup lang="ts">
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogScrollContent from "@/components/ui/dialog/DialogScrollContent.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import { api } from "@/lib/api";
import { useModalStore } from "@/stores/modal";
import { RefillSchema, type RefillSchemaInput } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm, Field, ErrorMessage } from "vee-validate";
import { computed, watch } from "vue";
import { toast } from "vue-sonner";
import Input from "@/components/ui/input/Input.vue";
import Switch from "@/components/ui/switch/Switch.vue";
import HelpTooltip from "@/components/ui/HelpTooltip.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import DateInput from "@/components/forms/DateInput.vue";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Label from "@/components/ui/label/Label.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import Icons from "@/components/icons/Icon.vue";
import { useVehicleQueries } from "@/lib/queries/useVehicleQueries";

const { activeVehicle } = useActiveVehicle();
const { vehicles } = useVehicleQueries();
const selectedVehicle = computed(() => vehicles.value?.find((vehicle) => vehicle.vehicleData.id === values.vehicleId));

const { handleSubmit, resetForm, isSubmitting, values, setFieldValue } = useForm({
  validationSchema: toTypedSchema(RefillSchema),
  initialValues: {
    fullRefill: true,
    skippedRefill: false,
    date: new Date(),
    vehicleId: activeVehicle.value?.vehicleData.id,
  },
});

// FUNCTIONS FOR CALCULATION HANDLING
const handleFuelAmountChange = (value: string | number) => {
  const fuelAmount = typeof value === "string" ? parseFloat(value) : value;
  setFieldValue("fuelAmount", isNaN(fuelAmount) ? null : fuelAmount, true);

  const pricePerUnit = Number(values.pricePerUnit);

  if (!isNaN(fuelAmount) && pricePerUnit) {
    const total = parseFloat((fuelAmount * pricePerUnit).toFixed(2));
    setFieldValue("totalCost", total, true);
  }
};

const handlePricePerUnitChange = (value: string | number) => {
  const pricePerUnit = typeof value === "string" ? parseFloat(value) : value;
  setFieldValue("pricePerUnit", isNaN(pricePerUnit) ? null : pricePerUnit, true);

  const fuelAmount = Number(values.fuelAmount);

  if (!isNaN(pricePerUnit) && fuelAmount) {
    const total = parseFloat((fuelAmount * pricePerUnit).toFixed(2));
    setFieldValue("totalCost", total, true);
  }
};

const handleTotalCostChange = (value: string | number) => {
  const totalCost = typeof value === "string" ? parseFloat(value) : value;
  setFieldValue("totalCost", isNaN(totalCost) ? null : totalCost, true);

  const fuelAmount = Number(values.fuelAmount);

  // Avoid division by zero and only calculate if fuelAmount is present
  if (!isNaN(totalCost) && fuelAmount && fuelAmount > 0) {
    const price = parseFloat((totalCost / fuelAmount).toFixed(3));
    setFieldValue("pricePerUnit", price, true);
  }
};

const queryClient = useQueryClient();
const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createRefill");
const handleClose = () => {
  modalStore.onClose();
};

const createRefillMutation = useMutation({
  mutationFn: async (data: RefillSchemaInput) => {
    console.log("runnign mutation");
    const response = await api.post("/logs/refill", data);
    return response.data;
  },
  onSuccess(_, variables) {
    toast.success("Refill created succesfully");
    queryClient.invalidateQueries({ queryKey: [variables.vehicleId] });
    queryClient.invalidateQueries({ queryKey: ["accessibleVehicles"] });
    handleClose();
  },
  onError(error) {
    console.error("API ERROR: ", error);
    toast.error("Error creating the Refill");
  },
});

const onSubmit = handleSubmit(async (values) => {
  console.log("debug: onsubmit");
  createRefillMutation.mutate(values);
});

watch(isModalOpen, (open) => {
  if (open && activeVehicle.value) {
    resetForm({
      values: {
        ...values,
        vehicleId: activeVehicle.value.vehicleData.id,
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
                :vehicles="vehicles"
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
            <Input
              name="odometer"
              type="number"
              placeholder="Odometer"
              :suffix="selectedVehicle?.vehicleData.odometerData.unit"
              data-cy="odometer-input"
            />
          </div>

          <!-- Fill Type -->
          <div class="grid grid-cols-2 gap-6">
            <Field v-slot="{ value, handleChange }" name="fullRefill">
              <Label
                class="text flex items-center gap-4 rounded border px-4 py-3 leading-none font-semibold select-none"
                data-cy="full-refill-switch"
              >
                <Switch :model-value="value" @update:checked="handleChange" />
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
              name="totalCost"
              type="number"
              step="0.01"
              placeholder="Total cost"
              :onValueChange="handleTotalCostChange"
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
