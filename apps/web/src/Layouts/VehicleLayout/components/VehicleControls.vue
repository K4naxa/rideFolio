<script setup lang="ts">
import ResponsiveDropdown from "@/components/forms/ResponsiveDropdown.vue";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";
import { useModalStore } from "@/stores/modal.ts";
import AlertModal from "@/modals/alertModal.vue";
import { computed, ref } from "vue";
import { useVehicleDelete } from "@/lib/queries/vehicles/vehicle-mutations.ts";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle.ts";
import { useRouter } from "vue-router";

const modalStore = useModalStore();
const router = useRouter();

const { mutateAsync: deleteVehicle } = useVehicleDelete();
const { currentVehicle, currentVehicleId, isVehicleOwner } = useCurrentVehicle();

function handleDeleteClick() {
  isDeleteModalOpen.value = true;
}

const isDeleteModalOpen = ref(false);

async function handleConfirmDelete() {
  if (!currentVehicleId.value) return;
  await deleteVehicle(currentVehicleId.value);
  await router.push("/dashboard");
}

const deleteModalDescription = computed(() =>
  currentVehicle.value?.vehicleData.name
    ? `Are you sure you want to delete <b>${currentVehicle.value.vehicleData.name}</b>? <br/> This action cannot be undone.`
    : "Are you sure you want to delete this vehicle? This action cannot be undone.",
);
</script>

<template>
  <ResponsiveDropdown
    :items="[
      {
        label: 'Details',
        action: () => modalStore.onOpen('vehicleDetails', currentVehicleId),
        icon: 'fileText',
      },
      {
        label: 'Edit',
        action: () => modalStore.onOpen('createVehicle', currentVehicleId),
        icon: 'edit',
        disabled: !isVehicleOwner,
      },
      {
        label: 'Delete',
        action: handleDeleteClick,
        icon: 'trash',
        disabled: !isVehicleOwner,
      },
    ]"
  >
    <template #header>
      <VehicleItem :vehicle="currentVehicle?.vehicleData" />
    </template>
  </ResponsiveDropdown>

  <AlertModal
    v-model:open="isDeleteModalOpen"
    title="Delete Vehicle"
    :description="deleteModalDescription"
    actionLabel="Delete"
    cancelLabel="Cancel"
    actionClass="bg-destructive text-destructive-foreground hover:bg-destructive/90"
    @action="handleConfirmDelete"
  />
</template>

<style scoped></style>
