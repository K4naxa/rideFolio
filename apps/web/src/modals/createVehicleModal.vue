<script setup lang="ts">
import VehicleTypeIcon from "@/components/icons/VehicleTypeIcon.vue";
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
import { api } from "@/lib/api";
import { useAccessibleVehicles } from "@/lib/queries/useAccessibleVehicles";
import { useModalStore } from "@/stores/modal";
import {
  CreateVehicleFrontendSchema,
  fuelTypeValues,
  OdometerTypeValues,
  VehicleTypeCodes,
} from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toTypedSchema } from "@vee-validate/zod";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import z from "zod";

const { data: vehicles } = useAccessibleVehicles();
const clientSchema = CreateVehicleFrontendSchema.extend({
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

const queryClient = useQueryClient();
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

// Form logic
const { handleSubmit, resetForm, values, meta } = useForm({
  validationSchema: toTypedSchema(clientSchema),
});

const createVehicleMutation = useMutation({
  mutationFn: async (data: typeof values) => {
    try {
      console.log("Submitting data", data);
      const response = await api.post("vehicles", data);
      console.log("Response", response);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  onSuccess: (data) => {
    toast.success("Vehicle created succesfully");
    queryClient.invalidateQueries({ queryKey: ["accessibleVehicles"] });
    handleClose();
    // Navigate after closing the modal
    setTimeout(() => {
      router.push(`/vehicles/${data.newVehicleId}`);
    }, 100);
  },
});

const onSubmit = handleSubmit(async (data) => {
  createVehicleMutation.mutate(data);
});
</script>

<template>
  <Dialog :open="isModalOpen" @update:open="handleClose">
    <DialogScrollContent class="max-w-2xl w-full">
      <DialogHeader>
        <DialogTitle>Create new vehicle</DialogTitle>
        <DialogDescription>
          Fill in the details below to add a new vehicle to your garage.
        </DialogDescription>
      </DialogHeader>

      <form @submit="onSubmit" class="space-y-8">
        <!-- Image Upload -->
        <Field v-slot="{ value, handleChange }" name="image">
          <UploadImage
            title="Upload a picture"
            :value="value"
            @change="handleChange"
            :disabled="createVehicleMutation.isPending.value"
          />
          <ErrorMessage name="image" class="text-sm text-destructive mt-1 ml-1" />
        </Field>

        <!-- Basic information -->
        <div class="space-y-6">
          <div>
            <h4 class="mb-2">Basic details</h4>
            <Separator />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Name -->

            <Input placeholder="Nickname *" name="name" type="text" />

            <!-- Type -->
            <Field v-slot="{ value, handleChange }" name="type">
              <div>
                <Select :model-value="value" @update:model-value="handleChange">
                  <SelectTrigger class="w-full">
                    <div class="flex gap-3 items-center">
                      <VehicleTypeIcon
                        v-if="value"
                        :type="value"
                        class="h-4 w-4 stroke-muted-foreground"
                      />
                      <SelectValue placeholder="Select vehicle type *" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectLabel>Vehicle type</SelectLabel>
                    <Separator class="mb-1" />
                    <SelectItem v-for="type in VehicleTypeCodes" :key="type" :value="type">
                      <span class="flex items-center gap-2">
                        <VehicleTypeIcon :type="type" class="h-4 w-4" /> {{ type }}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage name="type" class="text-sm text-destructive mt-1 ml-1" />
              </div>
            </Field>
          </div>

          <!-- Make and Model -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input placeholder="Make" name="make" type="text" />

            <Input placeholder="Model" name="model" type="text" />
          </div>

          <!-- Year and Odometer Type -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              placeholder="Year"
              type="number"
              name="year"
              :min="1900"
              :max="new Date().getFullYear()"
            />

            <Field v-slot="{ value, handleChange }" name="odometerType">
              <div>
                <Select :model-value="value" @update:model-value="handleChange">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Odometer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectLabel>Odometer type</SelectLabel>
                    <Separator class="mb-1" />

                    <SelectItem
                      v-for="type in OdometerTypeValues"
                      :key="type.value"
                      :value="type.value"
                    >
                      {{ type.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage name="odometerType" class="text-sm text-destructive mt-1 ml-1" />
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

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- VIN -->

            <Input placeholder="VIN" toUpperCase name="vin" type="text" />

            <!-- License Plate -->

            <Input placeholder="License plate" toUpperCase name="licensePlate" type="text" />
          </div>
        </div>

        <!-- Technical details -->
        <div class="space-y-4">
          <div>
            <h4 class="mb-2">Technical details</h4>
            <Separator />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Odometer -->

            <Input
              placeholder="Odometer"
              name="odometer"
              type="number"
              :min="0"
              input-mode="numeric"
              :suffix="
                values.odometerType === 'HOUR'
                  ? 'h'
                  : values.odometerType === 'MILE'
                    ? 'miles'
                    : 'km'
              "
            />

            <!-- Fuel Type -->
            <Field v-slot="{ value, handleChange }" name="fuelType">
              <div>
                <Select :model-value="value" @update:model-value="handleChange">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectLabel>Fuel type</SelectLabel>
                    <Separator class="mb-1" />

                    <SelectItem
                      v-for="type in fuelTypeValues"
                      :key="type.value"
                      :value="type.value"
                    >
                      {{ type.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage name="fuelType" class="text-sm text-destructive mt-1 ml-1" />
              </div>
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button v-if="createVehicleMutation.isPending.value" disabled variant="submit">
            <Spinner class="mr-2" />
            Creating...
          </Button>
          <Button v-else type="submit" variant="submit" :disabled="!meta.dirty"> Create </Button>

          <Button type="button" variant="outline" class="w-full sm:w-auto" @click="handleClose">
            Peruuta
          </Button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
