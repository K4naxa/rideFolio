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
</script>
<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <!-- Table Header -->
    <div
      class="text-accent-foreground bg-accent/50 grid grid-cols-[3rem_1fr_6rem_3rem] items-center gap-x-3 rounded-t border-b px-2"
      :class="props.size ? (props.size === 'sm' ? 'h-10' : 'h-12') : 'h-12'"
    >
      <Label class="flex justify-center">State</Label>
      <Label class="min-w-60">Name</Label>
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

    <ScrollArea v-if="filteredItems.length" class="min-h-0 flex-1">
      <!-- Table Body -->
      <ul v-auto-animate class="divide-border min-w-max divide-y overflow-hidden">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="listHover grid grid-cols-[3rem_1fr_6rem_3rem] gap-x-3 px-2"
          :class="[props.size ? (props.size === 'sm' ? 'py-2' : 'py-4') : 'py-4']"
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
          <div class="flex min-w-60 flex-col justify-center gap-1">
            <span :class="{ 'text-muted-foreground line-through': item.isPurchased }">
              {{ item.name }}
            </span>
          </div>

          <!-- Price -->
          <span>
            {{ item.price ? `$${item.price.toFixed(2)}` : "-" }}
          </span>

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
