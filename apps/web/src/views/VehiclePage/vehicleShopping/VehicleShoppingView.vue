<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";

import { useCurrentVehicle } from "@/lib/useCurrentVehicle";
import { ShoppingListItemSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import ShoppingTable from "./components/shoppingTable.vue";
import { useShoppingCreate } from "@/lib/queries/shopping/shopping-mutations";
const { currentVehicleId } = useCurrentVehicle();

const { mutateAsync: createItem } = useShoppingCreate();

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(ShoppingListItemSchema),
  initialValues: {
    vehicleId: currentVehicleId.value,
    name: "",
  },
});

const onSubmit = handleSubmit(async (values) => {
  createItem(values, {
    onSuccess: () => {
      toast.success("Item added to shopping list");
      resetForm();
    },
  });
});
</script>
<template>
  <main class="flex-1 space-y-6">
    <form @submit="onSubmit">
      <div class="flex flex-wrap items-start justify-evenly gap-4 sm:justify-normal">
        <Input
          name="name"
          type="text"
          placeholder="Name"
          class="min-w-xs flex-1 sm:max-w-md"
          :validate-on-blur="false"
        />
        <Input
          name="price"
          type="number"
          placeholder="Price"
          step="0.01"
          class="w-full min-w-32 flex-1 sm:max-w-32 sm:flex-none"
        />
        <Button type="submit" class="flex-1 sm:flex-none">Add Item</Button>
      </div>
    </form>

    <div class="flex min-h-0 flex-1 rounded border">
      <ShoppingTable />
    </div>
  </main>
</template>
