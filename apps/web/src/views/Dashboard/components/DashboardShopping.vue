<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import { Checkbox } from "@/components/ui/checkbox";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import FetchError from "@/components/ui/FetchError.vue";
import { useShoppingAll } from "@/lib/queries/shopping/shopping-queries";
import { useShoppingToggle } from "@/lib/queries/shopping/shopping-mutations";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useModalStore } from "@/stores/modal";
import { computed, ref } from "vue";
import DashboardSection from "./DashboardSection.vue";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

const modalStore = useModalStore();
const { preferredCurrencySymbol: cu } = useCurrentUser();
const initialRenderTime = ref(Date.now());

const { data: shoppingList, isLoading, isError, isFetching, refetch } = useShoppingAll();
const { mutate: toggleItem } = useShoppingToggle();

const displayedItems = computed(() =>
  shoppingList.value?.filter(
    (item) =>
      !item.isPurchased || (item?.purchasedAt && new Date(item.purchasedAt).getTime() > initialRenderTime.value),
  ),
);

const MAX_ITEMS = 8;
</script>

<template>
  <DashboardSection title="Shopping list" icon="shoppingCart">
    <template #action>
      <Button variant="ghost" size="icon-sm" @click="modalStore.onOpen('createShoppingItem')">
        <Icon name="plus" />
      </Button>
    </template>

    <div class="scrollbar-macos max-h-72 overflow-y-auto">
      <div v-if="isLoading" class="grid h-32 place-items-center">
        <Spinner class="text-muted-foreground size-8" />
      </div>
      <FetchError v-else-if="isError" title="Failed to load shopping list" :refetch :isFetching />

      <Empty v-else-if="!displayedItems || displayedItems.length === 0" class="card">
        <EmptyHeader>
          <EmptyTitle>Shopping list is empty</EmptyTitle>
          <EmptyDescription> Add items you need for your vehicles.</EmptyDescription>
        </EmptyHeader>
      </Empty>

      <ul v-else class="card divide-y overflow-x-hidden">
        <li
          v-for="item in displayedItems.slice(0, MAX_ITEMS)"
          :key="item.id"
          class="group cardHover flex items-center gap-4 px-3 py-2.5 shadow-none"
        >
          <Checkbox
            :model-value="item.isPurchased"
            @update:model-value="toggleItem({ itemId: item.id, purchased: !item.isPurchased })"
            class="group-hover:bg-accent/10 group-hover:border-foreground/50 size-5 bg-transparent"
            variant="secondary"
          />
          <div class="flex w-full items-center justify-between gap-4">
            <span class="shopping-strike text-sm" :class="item.isPurchased && 'text-muted-foreground purchased'">
              {{ item.name }}
            </span>
            <span class="text-muted-foreground shrink-0 text-xs" v-if="item.price"> {{ item.price }} {{ cu }} </span>
          </div>
        </li>
      </ul>
    </div>
  </DashboardSection>
</template>

<style scoped>
.shopping-strike {
  text-decoration: none;
  position: relative;
}
.shopping-strike::after {
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
.shopping-strike.purchased::after {
  transform: scaleX(1);
}
</style>
