<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import { Checkbox } from "@/components/ui/checkbox";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useVehicleShopping } from "@/lib/queries/shopping/shopping-queries";
import { computed, ref } from "vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser.ts";
import { useModalStore } from "@/stores/modal.ts";
import { useShoppingToggle } from "@/lib/queries/shopping/shopping-mutations.ts";

const { currentVehicleId } = useCurrentVehicle();
const { preferredCurrencySymbol: cu } = useCurrentUser();
const modalStore = useModalStore();

// used for showing purchased items that have been toggled in this render
const initialRenderTime = ref(Date.now());

const {
  data: shoppingList,
  isLoading: isShoppingLoading,
  isError: isShoppingError,
} = useVehicleShopping(currentVehicleId);
const { mutate: toggleItem } = useShoppingToggle();

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
    <div class="mb-1 flex items-center justify-between gap-2">
      <h2>Shopping list</h2>

      <Button
        @click="modalStore.onOpen('createShoppingItem')"
        variant="ghost"
        size="icon-sm"
        class="shrink-0 cursor-pointer"
      >
        <Icon name="plus" />
      </Button>
    </div>

    <div class="scrollbar-macos h-full overflow-y-auto rounded">
      <div v-if="isShoppingLoading" class="grid flex-1 place-items-center">
        <Spinner class="text-muted-foreground size-10" />
      </div>
      <div v-else-if="isShoppingError" class="grid flex-1 place-items-center">
        <span class="text-destructive">Error loading shopping list.</span>
      </div>

      <ul v-else class="card divide-y overflow-x-hidden">
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
          <div class="flex w-full items-center justify-between gap-4">
            <span class="line-through" :class="item.isPurchased && 'text-muted-foreground purchased'">
              {{ item.name }}
            </span>
            <span class="text-muted-foreground shrink-0" v-if="item.price"> {{ item.price }} {{ cu }} </span>
          </div>
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
