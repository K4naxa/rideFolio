<script setup lang="ts">
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogScrollContent from "@/components/ui/dialog/DialogScrollContent.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Input from "@/components/ui/input/Input.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectLabel from "@/components/ui/select/SelectLabel.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import UploadImage from "@/components/ui/UploadImage.vue";
import { useVehicleCreate } from "@/lib/queries/vehicles/vehicle-mutations";
import { useVehiclesAll, useVehicleTypes } from "@/lib/queries/vehicles/vehicle-queries";
import { useModalStore } from "@/stores/modal";
import { FUEL_TYPES, getOdometerUnit, ODOMETER_TYPES, VehicleInputSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import z from "zod";

const router = useRouter();

// Modal logic
const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createVehicle");
function handleClose() {
  modalStore.onClose();
  // Reset form after modal closes to ensure proper state
  setTimeout(() => {
    resetForm({});
  }, 100);
}

const { mutateAsync: createVehicleAsync, isPending: createPending } = useVehicleCreate();
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
        return !vehicles.value?.find(({ vehicleData }) => vehicleData.licensePlate === value);
      },
      { message: "License plate already exists" },
    ),
});

// Form logic
const { handleSubmit, resetForm, values } = useForm({
  validationSchema: toTypedSchema(clientSchema),
});

const onSubmit = handleSubmit(async (data) => {
  createVehicleAsync(data, {
    onSuccess: (data) => {
      toast.success("Vehicle created succesfully");
      handleClose();
      setTimeout(() => {
        router.push(`/vehicles/${data.newVehicleId}`);
      }, 100);
    },
  });
});

const selectedVehicleIcon = computed(() => {
  const selectedType = values.type;
  const vehicleType = vehicleTypes?.value ? vehicleTypes.value.find((type) => type.code === selectedType) : undefined;
  return vehicleType?.icon as IconProps["name"];
});
</script>

<template>
  <Dialog :open="isModalOpen" @update:open="handleClose">
    <DialogScrollContent class="w-full max-w-3xl">
      <DialogHeader>
        <DialogTitle>Create new vehicle</DialogTitle>
        <DialogDescription> Fill in the details below to add a new vehicle to your garage. </DialogDescription>
      </DialogHeader>

      <form @submit="onSubmit" class="space-y-8">
        <!-- Image Upload -->
        <Field v-slot="{ value, handleChange }" name="image">
          <UploadImage
            title="Upload a picture"
            :value="value"
            @change="handleChange"
            :disabled="createPending"
            data-cy="image"
          />
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

            <Input placeholder="Nickname *" name="name" type="text" data-cy="name" />

            <!-- Type -->
            <Field v-slot="{ value, handleChange }" name="type">
              <div>
                <Select :model-value="value" @update:model-value="handleChange">
                  <SelectTrigger class="w-full" data-cy="type-trigger">
                    <div class="flex items-center gap-3">
                      <Icon v-if="selectedVehicleIcon" :name="selectedVehicleIcon" class="h-4 w-4" />
                      <SelectValue placeholder="Select vehicle type *" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectLabel>Vehicle type</SelectLabel>
                    <Separator class="mb-1" />
                    <SelectItem
                      v-for="type in vehicleTypes"
                      :key="type.code"
                      :value="type.code"
                      :data-cy="`type-${type.code}-select`"
                    >
                      <span class="flex items-center gap-2">
                        <Icon
                          :name="type.icon ? (type.icon as IconProps['name']) : 'otherVehicle'"
                          :type="type"
                          class="h-4 w-4"
                        />
                        {{ type.code }}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage name="type" class="text-destructive mt-1 ml-1 text-sm" data-cy="type-error" />
              </div>
            </Field>
          </div>

          <!-- Make and Model -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input placeholder="Make" name="make" type="text" data-cy="make" />

            <Input placeholder="Model" name="model" type="text" data-cy="model" />
          </div>

          <!-- Year and Odometer Type -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              placeholder="Year"
              type="number"
              name="year"
              :min="1900"
              :max="new Date().getFullYear()"
              data-cy="year"
            />

            <Field v-slot="{ value, handleChange }" name="odometerType">
              <div>
                <Select :model-value="value" @update:model-value="handleChange">
                  <SelectTrigger class="w-full" data-cy="odometer-type-trigger">
                    <SelectValue placeholder="Odometer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectLabel>Odometer type</SelectLabel>
                    <Separator class="mb-1" />

                    <SelectItem
                      v-for="type in ODOMETER_TYPES"
                      :key="type.code"
                      :value="type.code"
                      :data-cy="`odometer-type-${type.code}-select`"
                    >
                      {{ type.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
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

            <Input placeholder="VIN" toUpperCase name="vin" type="text" data-cy="vin" />

            <!-- License Plate -->

            <Input
              placeholder="License plate"
              toUpperCase
              name="licensePlate"
              type="text"
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

            <Input
              placeholder="Odometer"
              name="odometer"
              type="number"
              :min="0"
              input-mode="numeric"
              :suffix="getOdometerUnit(values.odometerType)"
              data-cy="odometer"
            />

            <!-- Fuel Type -->
            <Field v-slot="{ value, handleChange }" name="fuelType">
              <div>
                <Select :model-value="value" @update:model-value="handleChange">
                  <SelectTrigger class="w-full" data-cy="fuel-type-trigger">
                    <SelectValue placeholder="Fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectLabel>Fuel type</SelectLabel>
                    <Separator class="mb-1" />

                    <SelectItem
                      v-for="type in FUEL_TYPES"
                      :key="type.code"
                      :value="type.code"
                      :data-cy="`fuel-type-${type.code}-select`"
                    >
                      {{ type.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage name="fuelType" class="text-destructive mt-1 ml-1 text-sm" data-cy="fuel-type-error" />
              </div>
            </Field>
          </div>
        </div>
      </form>

      <DialogFooter>
        <Button v-if="createPending" disabled variant="submit">
          <Spinner class="mr-2" />
          Creating...
        </Button>
        <Button v-else type="button" @click="onSubmit" variant="submit" data-cy="submit"> Create </Button>

        <Button type="button" variant="outline" class="w-full sm:w-auto" @click="handleClose"> Peruuta </Button>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>
