<script setup lang="ts">
import DateInput from "@/components/forms/DateInput.vue";
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import Button from "@/components/ui/button/Button.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogScrollContent from "@/components/ui/dialog/DialogScrollContent.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import UploadImage from "@/components/ui/UploadImage.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useModalStore } from "@/stores/modal";
import { MaintenanceSchema, type TMaintenanceFormPart } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import PartsFormField from "./components/partsFormField.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import { toast } from "vue-sonner";
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import { useMaintenanceTypes } from "@/lib/queries/maintenances/maintenance-queries";
import { useMaintenanceCreate } from "@/lib/queries/maintenances/maintenance-mutations";
import { useSelectedVehicle } from "@/lib/composables/useSelectedVehicle";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";

// Modal store
const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createMaintenance");
// Vehicle info
const { currentVehicleId } = useCurrentVehicle();

const { preferredCurrencySymbol } = useCurrentUser();
// Maintenance queries
const { mutateAsync: createMaintenanceAsync } = useMaintenanceCreate();

const {
  data: maintenanceTypes,
  isLoading: isLoadingTypes,
  error: maintenanceTypesError,
} = useMaintenanceTypes({
  enabled: isModalOpen,
});

const selectedType = computed(() => {
  return maintenanceTypes.value?.find((type) => type.id === values.typeId) || null;
});

const { resetForm, handleSubmit, values, isSubmitting, setFieldValue } = useForm({
  validationSchema: toTypedSchema(MaintenanceSchema),
  initialValues: {
    date: new Date(),
    parts: [],
    totalCost: null,
    serviceProvider: "",
    notes: "",
  },
});

const { selectedVehicleOdometerUnit, selectedVehicle } = useSelectedVehicle(computed(() => values.vehicleId));

// Separate ref for form parts to pass to PartsFormField component
const formParts = ref<TMaintenanceFormPart[]>([]);
watch(
  formParts,
  (newParts) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dbParts = newParts.map(({ code, validLocations, ...dbPart }) => dbPart);
    setFieldValue("parts", dbParts);
  },
  { deep: true },
);

function handleClose() {
  resetForm();
  modalStore.onClose();
}

const onSubmit = handleSubmit(async (values) => {
  try {
    console.log("Submitting maintenance with values:", values);
    await createMaintenanceAsync(values);
  } catch (error) {
    toast.error("Failed to create maintenance. Please try again.", {
      action: {
        label: "Try again",
        onClick: () => onSubmit(),
      },
    });
    console.error("Error creating maintenance:", error);
    return;
  }
  handleClose();
});

watch(isModalOpen, (open) => {
  if (open && currentVehicleId) {
    resetForm({
      values: {
        ...values,
        vehicleId: currentVehicleId.value,
        date: new Date(),
      },
    });
  }
});
</script>

<template>
  <Dialog :open="isModalOpen" @update:open="handleClose">
    <DialogScrollContent class="max-w-7xl">
      <form @submit="onSubmit" class="flex flex-col gap-6">
        <DialogHeader>
          <DialogTitle> <Icon name="maintenance" /> Create Maintenance </DialogTitle>
          <DialogDescription> Fill in the details below to create a new maintenance record. </DialogDescription>
        </DialogHeader>

        <div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
          <!--Left column  -->
          <div class="flex flex-col gap-6">
            <Field v-slot="{ value, handleChange }" name="vehicleId">
              <div>
                <VehicleSelect :value="value" @valueChange="handleChange" placeholder="Select a vehicle" />
                <ErrorMessage name="vehicleId" class="text-destructive mt-1 ml-2 text-sm" />
              </div>
            </Field>

            <div class="grid grid-cols-2 gap-6">
              <DateInput name="date" :initial-value="new Date()" disableFuture />
              <Input name="odometer" type="number" placeholder="Odometer" :suffix="selectedVehicleOdometerUnit" />
            </div>

            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Field v-slot="{ value, handleChange }" name="typeId">
                <div>
                  <Select :model-value="value" @update:model-value="handleChange">
                    <SelectTrigger class="w-full">
                      <div class="flex items-center gap-3">
                        <Icon
                          v-if="selectedType?.icon"
                          :name="selectedType.icon as IconProps['name']"
                          class="stroke-muted-foreground"
                        />
                        <SelectValue placeholder="Select maintenance type *" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <span v-if="isLoadingTypes"> <Spinner /> </span>
                      <span v-if="maintenanceTypesError" class="text-destructive">
                        Failed to load maintenance types
                      </span>
                      <SelectItem v-for="type in maintenanceTypes" :key="type.code" :value="type.id" class="flex gap-2">
                        <Icon v-if="type.icon" :name="type.icon as IconProps['name']" class="stroke-muted-foreground" />
                        <p class="capitalize">{{ type.code }}</p>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <ErrorMessage name="typeId" class="text-destructive mt-1 ml-1 text-sm" />
                </div>
              </Field>

              <Input name="totalCost" type="number" :suffix="preferredCurrencySymbol" placeholder="Total cost" />
            </div>

            <Input name="serviceProvider" type="text" placeholder="Service Provider" :validate-on-blur="false" />

            <div class="hidden space-y-3 lg:block">
              <Field v-slot="{ value, handleChange }" name="image">
                <UploadImage title="Upload a picture" :value="value" @change="handleChange" />
                <ErrorMessage name="image" class="text-destructive mt-1 ml-1 text-sm" />
              </Field>
            </div>

            <Textarea name="notes" class="hidden lg:flex" placeholder="Maintenance notes" />
          </div>

          <!-- RIGHT COLUMN -->
          <div class="flex flex-1 flex-col">
            <Label><Icon name="maintenance" /> Serviced parts</Label>

            <div class="flex flex-1">
              <PartsFormField
                :values="formParts"
                @update:values="formParts = $event"
                :selected-vehicle="selectedVehicle"
              />
              <ErrorMessage name="parts" class="text-destructive mt-1 ml-1 text-sm" />
            </div>
          </div>
        </div>

        <!-- MOBILE ONLY / RECEIPT AND NOTES -->
        <div class="mt-6 flex flex-col gap-6 lg:hidden">
          <Field v-slot="{ value, handleChange }" name="image">
            <UploadImage title="Upload a picture" :value="value" @change="handleChange" />
            <ErrorMessage name="image" class="text-destructive mt-1 ml-1 text-sm" />
          </Field>

          <Textarea name="notes" class="" placeholder="Maintenance notes" />
        </div>
        <DialogFooter class="pt-auto">
          <Button type="submit" :disabled="isSubmitting">
            <span v-if="!isSubmitting">Create</span>
            <span v-else> <Spinner /> Creating.. </span>
          </Button>
          <Button type="button" variant="outline" @click="handleClose">Cancel</Button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
