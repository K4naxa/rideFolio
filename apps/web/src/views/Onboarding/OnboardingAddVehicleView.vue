<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { Car, Lock } from "lucide-vue-next";

import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormInput from "@/components/forms/FormInput.vue";
import SelectLabel from "@/components/ui/select/SelectLabel.vue";
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import UploadImage from "@/components/ui/UploadImage.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";

import { useVehicleCreate } from "@/lib/queries/vehicles/vehicle-mutations";
import { useVehicleTypes } from "@/lib/queries/vehicles/vehicle-queries";

import { FUEL_TYPES, getOdometerUnit, ODOMETER_TYPES, VehicleInputSchema } from "@repo/validation";
import { useCurrentUser } from "@/lib/composables/useCurrentUser.ts";

const router = useRouter();

const { currentUser, canCreateVehicle, isLoading: isLoadingUser } = useCurrentUser();
const { mutateAsync: createVehicleAsync, isPending: isCreatingVehicle } = useVehicleCreate();
const { data: vehicleTypes } = useVehicleTypes();

const { handleSubmit, values } = useForm({
  validationSchema: VehicleInputSchema,
});

const selectedVehicleIcon = computed(() => {
  const selectedType = values.type;
  const vehicleType = vehicleTypes?.value ? vehicleTypes.value.find((type) => type.code === selectedType) : undefined;
  return vehicleType?.icon as IconProps["name"];
});

function skipOnboarding() {
  router.push({ name: "Dashboard" });
}

const onSubmitVehicle = handleSubmit(async (inputValues) => {
  try {
    const newVehicle = await createVehicleAsync({
      ...inputValues,
    });
    await router.push(`/vehicles/${newVehicle.newVehicleId}`);
  } catch (error) {
    toast.error("Failed to create vehicle. Please try again.");
    console.error(error);
  }
});
</script>

<template>
  <Card class="mx-auto w-full max-w-2xl overflow-hidden transition-all duration-300">
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-xl">
        <Car class="text-primary h-5 w-5" />
        Add your first vehicle
      </CardTitle>
      <CardDescription>Enter the basic details to get started tracking your rides.</CardDescription>
    </CardHeader>

    <!-- Plan limit reached -->
    <CardContent v-if="!isLoadingUser && !canCreateVehicle" class="space-y-4 py-8 text-center">
      <Lock class="text-muted-foreground mx-auto h-10 w-10" />
      <p class="font-medium">Vehicle limit reached</p>
      <p class="text-muted-foreground text-sm">
        Your current plan allows up to
        {{ currentUser?.subscriptionPlan.maxVehicles }}
        {{ currentUser?.subscriptionPlan.maxVehicles === 1 ? "vehicle" : "vehicles" }}. Upgrade your plan to add more.
      </p>
      <Button variant="outline" @click="skipOnboarding">Go to Dashboard</Button>
    </CardContent>

    <form v-else-if="!isLoadingUser && canCreateVehicle" class="space-y-8" @submit="onSubmitVehicle">
      <CardContent class="space-y-8">
        <Field v-slot="{ value, handleChange }" name="image">
          <UploadImage disabled title="Upload a picture" :value="value" data-cy="image" @change="handleChange" />
          <ErrorMessage name="image" class="text-destructive mt-1 ml-1 text-sm" />
        </Field>

        <div class="space-y-4">
          <h3 class="text-muted-foreground flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
            basic details
          </h3>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInput placeholder="Nickname *" name="name" type="text" data-cy="name" autocomplete="off" />

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

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInput placeholder="Make" name="make" type="text" data-cy="make" autocomplete="off" />
            <FormInput placeholder="Model" name="model" type="text" data-cy="model" autocomplete="off" />
          </div>

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

        <div class="space-y-2">
          <h3 class="text-muted-foreground flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
            specific details
          </h3>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInput placeholder="VIN" toUpperCase name="vin" type="text" data-cy="vin" autocomplete="off" />
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

        <div class="space-y-4">
          <div>
            <h4 class="mb-2">Technical details</h4>
            <Separator />
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInput
              placeholder="Odometer"
              name="odometer"
              type="number"
              autocomplete="off"
              :min="0"
              input-mode="numeric"
              :suffix="getOdometerUnit(values.odometerType)"
              data-cy="odometer"
            />

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

        <DialogFooter>
          <Button type="button" variant="outline" class="w-full sm:w-auto" @click="skipOnboarding">Skip</Button>

          <Button
            type="button"
            variant="submit"
            data-cy="submit"
            :disabled="isCreatingVehicle"
            @click="onSubmitVehicle"
          >
            <span v-if="isCreatingVehicle">
              <Spinner class="mr-2" />
              Creating...
            </span>
            <span v-else>Create Vehicle</span>
          </Button>
        </DialogFooter>
      </CardContent>
    </form>
  </Card>
</template>
