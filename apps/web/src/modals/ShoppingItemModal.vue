<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import FormInput from "@/components/forms/FormInput.vue";
import { useShoppingCreate } from "@/lib/queries/shopping/shopping-mutations";
import { useModalStore } from "@/stores/modal";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { ShoppingListItemSchema } from "@repo/validation";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";

const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createShoppingItem");
const handleClose = () => modalStore.onClose();

const { currentVehicleId } = useCurrentVehicle();
const { mutateAsync: createItem } = useShoppingCreate();

const { handleSubmit, resetForm, isSubmitting } = useForm({
  validationSchema: ShoppingListItemSchema,
  initialValues: {
    vehicleId: currentVehicleId.value,
    name: "",
    price: null,
    isPurchased: false,
  },
});

const onSubmit = handleSubmit(async (values) => {
  await createItem(values, {
    onSuccess: () => {
      modalStore.onClose();
    },
  });
});

watch(isModalOpen, (open) => {
  if (open) {
    resetForm({
      values: {
        vehicleId: currentVehicleId.value,
        name: "",
        price: null,
        isPurchased: false,
      },
    });
  }
});
</script>

<template>
  <ResponsiveFormDialog
    :open="isModalOpen"
    @close="handleClose"
    title="Add Shopping Item"
    description="Add an item to your vehicle's shopping list."
    icon="shoppingCart"
    content-class="max-w-lg"
  >
    <FormInput name="name" label="Name" placeholder="Brake pads, oil filter..." type="text" autocomplete="off" />
    <FormInput name="price" label="Price" placeholder="0.00" type="number" step="0.01" />

    <template #footer>
      <Button type="button" @click="onSubmit" :disabled="isSubmitting">
        <Spinner v-if="isSubmitting" class="mr-1" />
        {{ isSubmitting ? "Adding…" : "Add item" }}
      </Button>
      <Button type="button" variant="outline" @click="handleClose">Cancel</Button>
    </template>
  </ResponsiveFormDialog>
</template>
