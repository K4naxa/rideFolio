<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import { Checkbox } from "@/components/ui/checkbox";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useShoppingCreate, useShoppingToggle } from "@/lib/queries/shopping/shopping-mutations";
import { useVehicleShopping } from "@/lib/queries/shopping/shopping-queries";
import { ShoppingListItemSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { Field, Form } from "vee-validate";
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";

const { currentVehicleId } = useCurrentVehicle();

// used for showing purchased items that have been toggled in this render
const initialRenderTime = ref(Date.now());

const {
  data: shoppingList,
  isLoading: isShoppingLoading,
  isError: isShoppingError,
} = useVehicleShopping(currentVehicleId);
const { mutate: toggleItem } = useShoppingToggle();
const { mutate: createItem } = useShoppingCreate();

const isCreatingItem = ref(false);
const inputRef = useTemplateRef<HTMLInputElement>("inputRef");

const handleCreateItem = (values: any) => {
  console.log("Creating item with values:", values);
  createItem(
    {
      ...values,
    },
    {
      onSuccess: () => {
        isCreatingItem.value = false;
      },
    },
  );
};

// Autofocus the input when the form appears
watch(isCreatingItem, (newValue) => {
  if (newValue) {
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});

// Filtered list to show unpurchased items and recently purchased items (toggled after initial render)
const displayedItems = computed(() =>
  shoppingList.value?.filter(
    (item) =>
      !item.isPurchased || (item?.purchasedAt && new Date(item.purchasedAt).getTime() > initialRenderTime.value),
  ),
);
</script>

<template>
  <div class="flex h-full max-h-96 min-h-0 flex-col">
    <h2 class="mb-1">Shopping list</h2>

    <div class="scrollbar-macos h-full overflow-y-auto">
      <div v-if="isShoppingLoading" class="grid flex-1 place-items-center">
        <Spinner class="text-muted-foreground size-10" />
      </div>
      <div v-else-if="isShoppingError" class="grid flex-1 place-items-center">
        <span class="text-destructive">Error loading shopping list.</span>
      </div>

      <ul v-else class="card divide-y">
        <li
          v-for="item in displayedItems"
          :key="item.id"
          class="group cardHover flex items-center gap-4 px-3 py-2.5 shadow-none"
        >
          <Checkbox
            :model-value="item.isPurchased"
            @update:model-value="
              toggleItem({
                itemId: item.id,
                purchased: !item.isPurchased,
              })
            "
            class="group-hover:bg-accent/10 group-hover:border-foreground/50 size-6 bg-transparent"
            variant="secondary"
          />
          <div class="flex flex-col gap-0">
            <span class="line-through" :class="item.isPurchased && 'text-muted-foreground purchased'">
              {{ item.name }}
            </span>
          </div>
        </li>

        <!-- New item Form -->
        <li
          class="text-muted-foreground hover:text-foreground list-none px-3 py-2.5 transition-colors duration-100"
          @click="isCreatingItem = true"
        >
          <div v-if="!isCreatingItem" class="flex cursor-pointer items-center gap-4">
            <div class="grid size-6 place-items-center">
              <Icon name="plus" />
            </div>
            <span class="">Add new item</span>
          </div>

          <Form
            v-else
            class="flex items-center gap-4"
            name="Overview Shoppinglist"
            ref="shoppinglistForm"
            @submit="handleCreateItem"
            :validation-schema="toTypedSchema(ShoppingListItemSchema)"
          >
            <Button variant="outline" size="icon-sm" class="size-7" type="submit">
              <Icon name="plus" class="size-4" />
            </Button>
            <Field name="vehicleId" type="hidden" :value="currentVehicleId" />
            <Field name="isPurchased" type="hidden" :value="false" />
            <Field name="name" v-slot="{ value, handleChange }">
              <input
                ref="inputRef"
                class="inputMinimal"
                :value="value"
                @change="handleChange"
                @keydown.esc="isCreatingItem = false"
              />
            </Field>
          </Form>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.line-through {
  text-decoration: none;
  position: relative;
}
.line-through::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transition: transform 0.1s ease-in-out;
  transform-origin: left;
}
.line-through.purchased::after {
  transform: scaleX(1);
}
</style>
