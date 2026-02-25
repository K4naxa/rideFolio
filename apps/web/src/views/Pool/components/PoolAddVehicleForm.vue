<script setup lang="ts">
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import Input from "@/components/ui/input/Input.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { usePoolAddVehicles } from "@/lib/queries/pools/pool-mutations";
import type { PoolDetails } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { twMerge } from "tailwind-merge";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed } from "vue";
import { toast } from "vue-sonner";
import { array, cuid, object } from "zod";

const props = defineProps<{
  open: boolean;
  pool: PoolDetails;
}>();
const emit = defineEmits<{ (e: "update:open", value: boolean): void }>();

const { usersOwnVehicles } = useCurrentUser();
const { mutateAsync: addVehiclesToPool } = usePoolAddVehicles();

const filteredVehicles = computed(() =>
  usersOwnVehicles.value.filter(
    (vehicle) => !props.pool.vehicles.some(({ data }) => data.id === vehicle.vehicleData.id),
  ),
);

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(object({ poolId: cuid(), vehicleIds: array(cuid()) })),
});

const submit = handleSubmit(async (values) => {
  await addVehiclesToPool(values, {
    onSuccess() {
      toast.success("Vehicles added to the group successfully!");
      emit("update:open", false);
    },
    onError() {
      toast.error("Failed to add vehicles to the group. Please try again.");
    },
  });
});
</script>

<template>
  <ResponsiveFormDialog
    :open="props.open"
    @update:open="emit('update:open', $event)"
    title="Add Vehicles"
    description="Add vehicles to your group"
  >
    <template #default>
      <Input type="text" name="poolId" :initial-value="props.pool.id" hidden />

      <div class="grid min-h-36">
        <div v-if="filteredVehicles.length < 1" class="place-self-center">
          <EmptyDescription> You don't have any vehicles to add to this group. </EmptyDescription>
        </div>

        <Field v-else v-slot="{ value, handleChange }" name="vehicleIds" class="">
          <ErrorMessage name="vehicleIds" class="text-destructive mt-1 ml-2 text-sm" />
          <ul class="scrollbar-macos w-full min-w-0 space-y-3 overflow-hidden pb-3">
            <li
              for="selectedVehicle"
              v-for="{ vehicleData } in filteredVehicles"
              :key="vehicleData.id"
              @click="
                handleChange(
                  value?.includes(vehicleData.id)
                    ? value.filter((id: string) => id !== vehicleData.id)
                    : [...(value || []), vehicleData.id],
                )
              "
              :class="
                twMerge(
                  'listHover flex cursor-pointer items-center gap-3 rounded border p-2',
                  value?.includes(vehicleData.id) ? 'border-primary!' : 'border-border',
                )
              "
            >
              <VehicleItem :vehicle="vehicleData" variant="small" />
              <Icon name="check" class="text-primary mr-2 ml-auto" v-show="value?.includes(vehicleData.id)" />
            </li>
          </ul>
        </Field>
      </div>
    </template>
    <template #footer>
      <Button variant="outline" type="button" @click="emit('update:open', false)"> Cancel </Button>
      <Button v-if="filteredVehicles.length > 0" type="button" @click="submit()" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="flex items-center gap-2"> <Spinner /> Adding... </span>
        <span v-else>Add Vehicles</span>
      </Button>
    </template>
  </ResponsiveFormDialog>
</template>
