<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Empty from "@/components/ui/empty/Empty.vue";
import EmptyHeader from "@/components/ui/empty/EmptyHeader.vue";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import { useVehicleShopping } from "@/lib/queries/shopping/shopping-queries";
import { useShoppingDelete, useShoppingToggle } from "@/lib/queries/shopping/shopping-mutations";
import Button from "@/components/ui/button/Button.vue";
import Label from "@/components/ui/label/Label.vue";
import { BrushCleaningIcon } from "lucide-vue-next";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { computed } from "vue";
import Icon from "@/components/icons/Icon.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";

interface ShoppingTableProps {
  hidePurchased?: boolean;
  size?: "sm" | "md";
}
const props = defineProps<ShoppingTableProps>();
const { preferredCurrencySymbol } = useCurrentUser();
const { currentVehicleId } = useCurrentVehicle();

const { data: vehicleShoppingList, isLoading } = useVehicleShopping(currentVehicleId);
const { mutate: toggleItem } = useShoppingToggle();
const { mutateAsync: deleteItem } = useShoppingDelete();
const isMobile = useIsMobile();

const filteredItems = computed(() => {
  if (!vehicleShoppingList.value) return [];
  let filtered = [...vehicleShoppingList.value];
  if (props.hidePurchased) {
    filtered = filtered.filter((item) => !item.isPurchased);
  }

  // sort unpurchased items first, followed by purchased items sorted by purchase date (newest first)
  filtered = filtered.sort((a, b) => {
    if (a.isPurchased === b.isPurchased) {
      if (a.isPurchased && b.isPurchased) {
        return new Date(b.purchasedAt || 0).getTime() - new Date(a.purchasedAt || 0).getTime();
      }
      return 0;
    }
    return a.isPurchased ? 1 : -1;
  });

  return filtered;
});

const handleCleanup = async () => {
  const completed = vehicleShoppingList.value?.filter((item) => item.isPurchased) || [];
  for (const item of completed) {
    await deleteItem({ itemId: item.id, vehicleId: item.vehicleId });
  }
};

const longestPriceWidth = ref(0);
const gridColStyle = computed(() => {
  let cappedWidth = Math.max(longestPriceWidth.value, 48);
  cappedWidth = Math.min(cappedWidth, isMobile.value ? 60 : 190);
  console.log("Comparing widths:", longestPriceWidth.value, cappedWidth);
  console.log("isMobile:", isMobile.value);
  return `grid-template-columns: 3rem auto ${cappedWidth}px 3rem;`;
});

const updateLongestPriceWidth = () => {
  nextTick(() => {
    const priceElements = document.querySelectorAll(".ShoppingItemPriceContainer");

    let maxWidth = 0;
    priceElements.forEach((el) => {
      const width = (el as HTMLElement).scrollWidth;
      if (width > maxWidth) maxWidth = width;
    });
    longestPriceWidth.value = maxWidth;
  });
};

onMounted(updateLongestPriceWidth);
watch(filteredItems, updateLongestPriceWidth, { deep: true });
</script>
<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <!-- Table Header -->
    <div v-if="filteredItems.length && !isLoading" as-child class="scrollbar-thin min-h-0 w-full min-w-0 flex-1">
      <div
        class="text-accent-foreground bg-muted sticky top-0 left-0 z-10 grid items-center gap-4 rounded-t-lg border-b px-2 shadow-sm lg:gap-6"
        :class="props.size ? (props.size === 'sm' ? 'h-10' : 'h-12') : 'h-12'"
        :style="gridColStyle"
      >
        <Label class="flex justify-center">State</Label>
        <Label class="">Name</Label>
        <Label>Price</Label>
        <Button
          variant="outline"
          class="hover:stroke-muted-foreground stroke-accent-foreground"
          size="icon-sm"
          @click="handleCleanup()"
        >
          <BrushCleaningIcon class="stroke-inherit" />
        </Button>
      </div>

      <!-- Table Body -->
      <ul v-auto-animate class="divide-border divide-y">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="listHover grid gap-4 px-2 lg:gap-6"
          :class="[props.size ? (props.size === 'sm' ? 'py-2' : 'py-4') : 'py-4']"
          :style="gridColStyle"
        >
          <!-- Checkbox -->
          <div class="flex w-12 items-center justify-center">
            <Checkbox
              :model-value="item.isPurchased"
              @update:model-value="
                toggleItem({
                  itemId: item.id,
                  purchased: !item.isPurchased,
                })
              "
              class="size-6"
            />
          </div>

          <!-- Item Content -->
          <div class="flex w-full flex-col justify-center gap-1">
            <span :class="{ 'text-muted-foreground line-through': item.isPurchased }">
              {{ item.name }}
            </span>
          </div>

          <!-- Price -->
          <span v-if="item.price" class="ShoppingItemPriceContainer my-auto truncate overflow-hidden">
            {{ item.price }} {{ preferredCurrencySymbol }}
          </span>
          <span v-else />

          <Button variant="outline" size="icon" @click="deleteItem({ itemId: item.id, vehicleId: item.vehicleId })">
            <Icon name="trash" className="stroke-inherit" />
          </Button>
        </div>
      </ul>
    </div>

    <!-- Empty State -->
    <div v-else class="grid flex-1 place-content-center">
      <p v-if="isLoading" class="text-muted-foreground"><Spinner /> Loading</p>

      <Empty v-else-if="!vehicleShoppingList?.length">
        <EmptyHeader>
          <EmptyTitle class="text-foreground"> You have no items in your shopping list</EmptyTitle>
          <EmptyDescription> Add new items to your shopping list to get started! </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  </div>
</template>
<style scoped></style>
