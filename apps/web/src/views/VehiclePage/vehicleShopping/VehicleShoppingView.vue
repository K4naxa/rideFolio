<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { Icons } from "@/components/utility/icons";
import { useShoppingQueries } from "@/lib/queries/useShoppingQueries";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { ShoppingListItemSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { BrushCleaningIcon } from "lucide-vue-next";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
const { activeVehicleId } = useActiveVehicle();

const { vehicleShoppingList, vehicleShoppingListLoading, toggleItem, deleteItem, createItem } =
  useShoppingQueries(activeVehicleId);

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(ShoppingListItemSchema),
  initialValues: {
    vehicleId: activeVehicleId.value,
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

const handleCleanup = async () => {
  const completed = vehicleShoppingList.value?.filter((item) => item.isPurchased) || [];
  for (const item of completed) {
    await deleteItem({ itemId: item.id, vehicleId: item.vehicleId });
  }
};
</script>
<template>
  <main class="space-y-6">
    <form @submit="onSubmit">
      <div class="flex gap-4 items-start flex-wrap justify-evenly sm:justify-normal">
        <Input
          name="name"
          type="text"
          placeholder="Name"
          class="flex-1 min-w-xs sm:max-w-md"
          :validate-on-blur="false"
        />
        <Input
          name="price"
          type="number"
          placeholder="Price"
          step="0.01"
          class="w-full min-w-32 sm:max-w-32 flex-1 sm:flex-none"
        />
        <Button type="submit" class="flex-1 sm:flex-none">Add Item</Button>
      </div>
    </form>

    <div class="border rounded-lg">
      <div class="overflow-x-auto scrollbar">
        <!-- Table Header -->
        <div
          class="grid grid-cols-[3rem_1fr_6rem_3rem] min-w-max items-center gap-x-3 h-14 px-3 border-b text-sm text-accent-foreground font-medium bg-accent/50"
        >
          <Label class="flex justify-center">State</Label>
          <Label class="min-w-60">Name</Label>
          <Label>Price</Label>
          <Button variant="outline" size="icon" @click="handleCleanup()">
            <BrushCleaningIcon
          /></Button>
        </div>

        <!-- Table Body -->
        <ul
          v-auto-animate
          v-if="!vehicleShoppingListLoading"
          class="divide-y divide-border min-w-max overflow-hidden"
        >
          <div
            v-for="item in vehicleShoppingList"
            :key="item.id"
            :class="[
              'grid grid-cols-[3rem_1fr_6rem_3rem] gap-x-3 py-4 px-3 hover:bg-accent/30 transition-colors duration-150',
            ]"
          >
            <!-- Checkbox -->
            <div class="flex items-center justify-center">
              <Checkbox
                :model-value="item.isPurchased"
                @update:model-value="
                  toggleItem({
                    itemId: item.id,
                    vehicleId: item.vehicleId,
                    purchased: !item.isPurchased,
                  })
                "
                class="size-6"
              />
            </div>

            <!-- Todo Content -->
            <div class="flex flex-col justify-center gap-1 min-w-60">
              <span :class="{ 'line-through text-muted-foreground': item.isPurchased }">
                {{ item.name }}
              </span>
            </div>

            <!-- Due Info -->

            <span>
              {{ item.price ? `$${item.price.toFixed(2)}` : "-" }}
            </span>

            <Button
              variant="outline"
              size="icon"
              @click="deleteItem({ itemId: item.id, vehicleId: item.vehicleId })"
              ><Icons.trash
            /></Button>
          </div>
        </ul>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="vehicleShoppingList && vehicleShoppingList.length === 0"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <p class="text-muted-foreground">
        {{ "Your shopping list is empty. Add items using the form above to get started!" }}
      </p>
    </div>
  </main>
</template>
