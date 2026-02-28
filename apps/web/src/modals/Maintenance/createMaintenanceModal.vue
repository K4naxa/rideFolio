<script setup lang="ts">
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import Button from "@/components/ui/button/Button.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogScrollContent from "@/components/ui/dialog/DialogScrollContent.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import UploadImage from "@/components/ui/UploadImage.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useModalStore } from "@/stores/modal";
import { type MaintenancePartInput, MaintenanceSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { ErrorMessage, Field, useFieldArray, useForm } from "vee-validate";
import { computed, provide, watch } from "vue";
import PartsFormField from "./components/partsFormField.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import Icon from "@/components/icons/Icon.vue";
import { useMaintenanceCreate } from "@/lib/queries/maintenances/maintenance-mutations";
import { useSelectedVehicle } from "@/lib/composables/useSelectedVehicle";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { PartsFieldKey } from "@/modals/Maintenance/composables/injection-keys";
import FormDateInput from "@/components/forms/FormDateInput.vue";

// Modal store
const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createMaintenance");
// Vehicle info
const { currentVehicleId } = useCurrentVehicle();
const { preferredCurrencySymbol } = useCurrentUser();
// Maintenance queries
const { mutateAsync: createMaintenanceAsync } = useMaintenanceCreate();

const { resetForm, handleSubmit, values, isSubmitting } = useForm({
  name: "Create Maintenance Form",
  validationSchema: toTypedSchema(MaintenanceSchema),
  initialValues: {
    date: new Date(),
    parts: [],
    totalCost: null,
    serviceProvider: "",
    notes: "",
  },
});

const { fields, push, remove, replace, update } = useFieldArray<MaintenancePartInput>("parts");

// Provide parts field array methods to child components
provide(PartsFieldKey, {
  push,
  remove,
  update,
  replace,
  fields,
});

const { selectedVehicleOdometerUnit, selectedVehicle } = useSelectedVehicle(computed(() => values.vehicleId));

function handleClose() {
  resetForm();
  modalStore.onClose();
}

const onSubmit = handleSubmit(async (values) => {
  try {
    console.log("Submitting maintenance with values:", values);
    await createMaintenanceAsync(values);
  } catch (error) {
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

        <div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
          <!--Left column  -->
          <div class="flex flex-col gap-4">
            <Field v-slot="{ value, handleChange }" name="vehicleId">
              <div>
                <VehicleSelect :value="value" @valueChange="handleChange" placeholder="Select a vehicle" />
                <ErrorMessage name="vehicleId" class="text-destructive mt-1 ml-2 text-sm" />
              </div>
            </Field>

            <div class="grid grid-cols-2 gap-4">
              <FormDateInput name="date" :initial-value="new Date()" disableFuture />
              <Input name="odometer" type="number" placeholder="Odometer" :suffix="selectedVehicleOdometerUnit" />
            </div>

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Input name="title" type="text" placeholder="Title" :maxlength="100" />
              <Input name="totalCost" type="number" :suffix="preferredCurrencySymbol" placeholder="Total cost" />
            </div>

            <Input
              name="serviceProvider"
              type="text"
              placeholder="Service Provider"
              :validate-on-blur="false"
              :maxlength="255"
            />

            <div class="hidden space-y-3 lg:block">
              <Field v-slot="{ value, handleChange }" name="image">
                <UploadImage title="Upload a picture" :value="value" @change="handleChange" />
                <ErrorMessage name="image" class="text-destructive mt-1 ml-1 text-sm" />
              </Field>
            </div>

            <Textarea name="notes" class="hidden lg:flex" placeholder="Maintenance notes" :maxlength="1000" />
          </div>

          <!-- RIGHT COLUMN -->
          <div class="flex flex-1 flex-col">
            <Label> <Icon name="maintenance" /> Serviced parts </Label>

            <div class="flex h-full min-h-0 lg:max-h-none">
              <PartsFormField :selected-vehicle="selectedVehicle" class="min-h-0 flex-1" />
              <ErrorMessage name="parts" class="text-destructive mt-1 ml-1 text-sm" />
            </div>
          </div>
        </div>

        <!-- MOBILE ONLY / RECEIPT AND NOTES -->
        <div class="flex flex-col gap-4 lg:hidden">
          <Field v-slot="{ value, handleChange }" name="image">
            <UploadImage title="Upload a picture" :value="value" @change="handleChange" />
            <ErrorMessage name="image" class="text-destructive mt-1 ml-1 text-sm" />
          </Field>

          <Textarea name="notes" class="" placeholder="Maintenance notes" :maxlength="1000" />
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
