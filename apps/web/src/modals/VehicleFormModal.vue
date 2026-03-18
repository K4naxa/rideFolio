<script setup lang="ts">
import { type IconProps } from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogScrollContent from "@/components/ui/dialog/DialogScrollContent.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import UploadImage from "@/components/ui/UploadImage.vue";
import { useVehicleCreate, useVehicleUpdate } from "@/lib/queries/vehicles/vehicle-mutations";
import { useVehicleByIdQuery, useVehiclesAll, useVehicleTypes } from "@/lib/queries/vehicles/vehicle-queries";
import { useModalStore } from "@/stores/modal";
import { FUEL_TYPES, getOdometerUnit, ODOMETER_TYPES, VehicleInputSchema } from "@repo/validation";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import z from "zod";
import FormInput from "@/components/forms/FormInput.vue";
import ResponsiveSelect from "@/components/forms/ResponsiveSelect.vue";
import type { ResponsiveSelectOption } from "@/components/forms/ResponsiveSelect.vue";

const router = useRouter();

// Modal logic
const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createVehicle");
const { data: editableVehicle } = useVehicleByIdQuery(
  computed(() => (isModalOpen.value ? modalStore.itemId : undefined)),
);
const isCreatingNew = computed(() => !modalStore.itemId);
function handleClose() {
  modalStore.onClose();
}

const { mutateAsync: createVehicleAsync, isPending: createPending } = useVehicleCreate();
const { mutateAsync: updateVehicleAsync } = useVehicleUpdate();
const { data: vehicles } = useVehiclesAll();
const { data: vehicleTypes } = useVehicleTypes({ enabled: isModalOpen });

const clientSchema = VehicleInputSchema.extend({
  licensePlate: z
    .string()
    .optional()
    .refine(
      async (value) => {
        if (!value) return true;

        if (!vehicles) return true;
        return !vehicles.value?.find(
          ({ vehicleData }) => vehicleData.licensePlate === value && vehicleData.id !== editableVehicle.value?.id,
        );
      },
      { message: "License plate already exists" },
    ),
});

// Form logic
const { handleSubmit, values, resetForm } = useForm({
  name: "Vehicle form",
  validationSchema: clientSchema,
});

const onSubmit = handleSubmit(async (data) => {
  // if there's no modalData, we're creating a new vehicle.
  if (isCreatingNew.value) {
    await createVehicleAsync(data, {
      onSuccess: (data) => {
        toast.success("Vehicle created successfully");
        handleClose();
        setTimeout(() => {
          router.push(`/vehicles/${data.newVehicleId}`);
        }, 100);
      },
    });
  } else {
    if (!editableVehicle.value?.id) {
      toast.error("Failed to update vehicle. Please try again.");
      return;
    }
    await updateVehicleAsync(
      { vehicleId: editableVehicle.value.id, data },
      {
        onSuccess: () => {
          toast.success("Vehicle updated successfully");
          handleClose();
        },
        onError: () => {
          toast.error("Failed to update vehicle. Please try again.");
        },
      },
    );
  }
});

const vehicleTypeOptions = computed<ResponsiveSelectOption<string>[]>(() =>
  (vehicleTypes?.value ?? []).map((type) => ({
    value: type.code,
    label: type.code,
    icon: (type.icon as IconProps["name"]) ?? "otherVehicle",
  })),
);

const odometerTypeOptions = computed<ResponsiveSelectOption<string>[]>(() =>
  Object.values(ODOMETER_TYPES).map((type) => ({
    value: type.code,
    label: type.label,
  })),
);

const fuelTypeOptions = computed<ResponsiveSelectOption<string>[]>(() =>
  Object.values(FUEL_TYPES).map((type) => ({
    value: type.code,
    label: type.label,
  })),
);

watch([isModalOpen, editableVehicle], ([open, vehicle]) => {
  if (open && vehicle) {
    resetForm({
      values: {
        name: vehicle.name,
        type: vehicle.type.code,
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year || undefined,
        odometerType: vehicle.odometerData?.type || undefined,
        vin: vehicle.vin || "",
        odometer: vehicle.odometerData?.value || undefined,
        licensePlate: vehicle.licensePlate || "",
        fuelType: vehicle.fuelType || undefined,
        // TODO: add image support
      },
    });
  } else {
    resetForm({
      values: {
        name: "",
        type: "",
        make: "",
        model: "",
        year: undefined,
        odometerType: undefined,
        vin: "",
        odometer: undefined,
        licensePlate: "",
        fuelType: undefined,
      },
    });
  }
});
</script>

<template>
  <Dialog :open="isModalOpen" @update:open="handleClose">
    <DialogScrollContent class="w-full max-w-3xl">
      <DialogHeader>
        <DialogTitle>{{ isCreatingNew ? "Create new vehicle" : "Edit vehicle" }}</DialogTitle>
        <DialogDescription>
          {{
            isCreatingNew
              ? "Fill in the details below to add a new vehicle to your garage."
              : "Edit the details of your vehicle."
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit="onSubmit" class="space-y-8">
        <!-- Image Upload -->
        <Field v-slot="{ value, handleChange }" name="image">
          <UploadImage disabled title="Upload a picture" :value="value" @change="handleChange" data-cy="image" />
          <ErrorMessage name="image" class="text-destructive mt-1 ml-1 text-sm" />
        </Field>

        <!-- Basic information -->
        <div class="space-y-6">
          <div>
            <h4 class="mb-2">Basic details</h4>
            <Separator />
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- Name -->

            <FormInput placeholder="Nickname *" name="name" type="text" data-cy="name" autocomplete="off" />

            <!-- Type -->
            <Field v-slot="{ value, handleChange }" name="type">
              <div>
                <ResponsiveSelect
                  :options="vehicleTypeOptions"
                  :modelValue="value"
                  @update:model-value="handleChange"
                  :disabled="!isCreatingNew"
                  placeholder="Select vehicle type *"
                  title="Vehicle type"
                  triggerClass="inputField"
                />
                <ErrorMessage name="type" class="text-destructive mt-1 ml-1 text-sm" data-cy="type-error" />
              </div>
            </Field>
          </div>

          <!-- Make and Model -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInput placeholder="Make" name="make" type="text" data-cy="make" autocomplete="off" />

            <FormInput placeholder="Model" name="model" type="text" data-cy="model" autocomplete="off" />
          </div>

          <!-- Year and Odometer Type -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInput
              placeholder="Year"
              type="number"
              name="year"
              autocomplete="off"
              :min="1900"
              :max="new Date().getFullYear()"
              data-cy="year"
            />

            <Field v-slot="{ value, handleChange }" name="odometerType">
              <div>
                <ResponsiveSelect
                  :options="odometerTypeOptions"
                  :modelValue="value"
                  @update:model-value="handleChange"
                  :disabled="!isCreatingNew"
                  placeholder="Odometer type"
                  title="Odometer type"
                  triggerClass="inputField"
                />
                <ErrorMessage
                  name="odometerType"
                  class="text-destructive mt-1 ml-1 text-sm"
                  data-cy="odometer-type-error"
                />
              </div>
            </Field>
          </div>
        </div>

        <!-- Vehicle legal information -->
        <div class="space-y-4">
          <div>
            <h4 class="mb-2">Vehicle specific details</h4>
            <Separator />
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- VIN -->

            <FormInput placeholder="VIN" toUpperCase name="vin" type="text" data-cy="vin" autocomplete="off" />

            <!-- License Plate -->

            <FormInput
              placeholder="License plate"
              toUpperCase
              name="licensePlate"
              type="text"
              autocomplete="off"
              data-cy="license-plate"
              :maxLength="10"
            />
          </div>
        </div>

        <!-- Technical details -->
        <div class="space-y-4">
          <div>
            <h4 class="mb-2">Technical details</h4>
            <Separator />
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- Odometer -->

            <FormInput
              :disabled="!isCreatingNew"
              placeholder="Odometer"
              name="odometer"
              type="number"
              autocomplete="off"
              :min="0"
              input-mode="numeric"
              :suffix="getOdometerUnit(values.odometerType)"
              data-cy="odometer"
            />

            <!-- Fuel Type -->
            <Field v-slot="{ value, handleChange }" name="fuelType">
              <div>
                <ResponsiveSelect
                  :options="fuelTypeOptions"
                  :modelValue="value"
                  @update:model-value="handleChange"
                  :disabled="!isCreatingNew"
                  placeholder="Fuel type"
                  title="Fuel type"
                  triggerClass="inputField"
                />
                <ErrorMessage name="fuelType" class="text-destructive mt-1 ml-1 text-sm" data-cy="fuel-type-error" />
              </div>
            </Field>
          </div>
        </div>
      </form>

      <DialogFooter>
        <Button v-if="createPending" disabled variant="submit">
          <Spinner class="mr-2" />
          {{ isCreatingNew ? "Creating…" : "Updating…" }}
        </Button>
        <Button v-else type="button" @click="onSubmit" variant="submit" data-cy="submit">
          {{ isCreatingNew ? "Create" : "Update" }}
        </Button>

        <Button type="button" variant="outline" class="w-full sm:w-auto" @click="handleClose"> Cancel </Button>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>
