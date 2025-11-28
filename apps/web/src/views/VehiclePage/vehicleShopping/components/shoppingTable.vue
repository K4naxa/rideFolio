<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Label from "@/components/ui/label/Label.vue";
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import ScrollBar from "@/components/ui/scroll-area/ScrollBar.vue";
import { BrushCleaningIcon } from "lucide-vue-next";
import { useShoppingQueries } from "@/lib/queries/useShoppingQueries";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { computed } from "vue";
import Icon from "@/components/icons/Icon.vue";

interface ShoppingTableProps {
  hidePurchased?: boolean;
  size?: "sm" | "md";
}
const props = defineProps<ShoppingTableProps>();

const { activeVehicleId } = useActiveVehicle();
const { vehicleShoppingList, toggleItem, deleteItem } = useShoppingQueries(activeVehicleId);
const isMobile = useMediaQuery("(max-width: 768px)");

const filteredItems = computed(() => {
  if (!vehicleShoppingList.value) return [];
  let filtered = vehicleShoppingList.value;
  if (props.hidePurchased) {
    filtered = filtered.filter((item) => !item.isPurchased);
  }
  return filtered;
});

const handleCleanup = async () => {
  const completed = vehicleShoppingList.value?.filter((item) => item.isPurchased) || [];
  for (const item of completed) {
    await deleteItem({ itemId: item.id, vehicleId: item.vehicleId });
  }
};

import { ref, onMounted, nextTick, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";

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
    <ScrollArea v-if="filteredItems.length" as-child class="min-h-0 w-full min-w-0 flex-1">
      <div
        class="text-accent-foreground bg-muted sticky top-0 left-0 z-10 grid items-center gap-4 rounded-t border-b px-2 shadow-sm lg:gap-6"
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
            <button
              v-if="!item.isPurchased"
              @click="
                toggleItem({
                  itemId: item.id,
                  vehicleId: item.vehicleId,
                  purchased: !item.isPurchased,
                })
              "
              class="border-foreground/50 text-foreground/40 flex size-5 items-center justify-center rounded-full border hover:cursor-pointer hover:border-blue-500 hover:text-blue-500"
            ></button>
            <button
              v-else
              @click="
                toggleItem({
                  itemId: item.id,
                  vehicleId: item.vehicleId,
                  purchased: !item.isPurchased,
                })
              "
              class="flex items-center justify-center rounded-full hover:cursor-pointer"
            >
              <Icon name="check" class="stroke-green-500" />
            </button>
          </div>

          <!-- Item Content -->
          <div class="flex w-full flex-col justify-center gap-1">
            <span :class="{ 'text-muted-foreground line-through': item.isPurchased }">
              {{ item.name }}
            </span>
          </div>

          <!-- Price -->
          <span v-if="item.price" class="ShoppingItemPriceContainer my-auto truncate overflow-hidden">
            {{ item.price }}
          </span>
          <span v-else />

          <Button variant="outline" size="icon" @click="deleteItem({ itemId: item.id, vehicleId: item.vehicleId })">
            <Icon name="trash" className="stroke-inherit" />
          </Button>
        </div>
      </ul>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>

    <!-- Empty State -->
    <div v-else class="flex flex-1 flex-col items-center justify-center py-12 text-center">
      <p class="text-muted-foreground">Your shopping list is empty.</p>
    </div>
  </div>
</template>
<style scoped></style>
