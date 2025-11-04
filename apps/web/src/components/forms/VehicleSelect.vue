<script setup lang="ts">
import { computed, ref } from "vue";
import Popover from "../ui/popover/Popover.vue";
import PopoverTrigger from "../ui/popover/PopoverTrigger.vue";
import Button from "../ui/button/Button.vue";
import type { TAccessibleVehicle } from "@repo/validation";
import VehicleSelectItem from "@/components/forms/VehicleSelectItem.vue";
import { ChevronsUpDown } from "lucide-vue-next";
import PopoverContent from "@/components/ui/popover/PopoverContent.vue";
import Separator from "../ui/separator/Separator.vue";

interface VehicleSelectProps {
  vehicles: TAccessibleVehicle[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}
const props = defineProps<VehicleSelectProps>();
const emits = defineEmits<{
  valueChange: [value: string];
}>();

function handleSelect(vehicleId: string) {
  emits("valueChange", vehicleId);
  open.value = false;
}

console.log("vehicles: ", props.vehicles);

const open = ref(false);
const search = ref<string>("");
const filteredVehicles = computed(() => {
  const searchLower = search.value.toLowerCase();
  return props.vehicles.filter(
    ({ vehicleData }) =>
      vehicleData.name.toLowerCase().includes(searchLower) ||
      vehicleData.licensePlate?.toLowerCase().includes(searchLower) ||
      vehicleData.model?.toLowerCase().includes(searchLower) ||
      vehicleData.make?.toLowerCase().includes(searchLower),
  );
});

const selectedVehicle = computed(() =>
  props.vehicles.find((vehicle) => vehicle.vehicleData.id === props.value),
);
</script>

<template>
  <Popover :open="open" @update:open="(value) => (open = value)" key="VehicleSelect">
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        class="w-full active:scale-100 h-fit"
        :aria-expanded="open"
      >
        <VehicleSelectItem
          v-if="selectedVehicle"
          :vehicle="selectedVehicle.vehicleData"
          class="w-full"
        />
        <span v-else class="text-muted-foreground py-2">{{ placeholder }}</span>
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>

    <PopoverContent
      class="w-(--reka-popover-trigger-width) p-0"
      align="start"
      key="VehicleSelectContent"
    >
      <input
        type="search"
        v-model="search"
        placeholder="Search"
        autofocus="false"
        class="bg-background border-none focus-visible:ring-0 w-full px-3 py-2 outline-none rounded"
      />
      <Separator />
      <div
        v-if="filteredVehicles.length > 0"
        class="p-2 space-y-1 max-h-72 overflow-y-auto scrollbar"
      >
        <VehicleSelectItem
          v-for="vehicle in filteredVehicles"
          :key="vehicle.vehicleData.id"
          :vehicle="vehicle.vehicleData"
          @click="handleSelect(vehicle.vehicleData.id)"
          class="hover:bg-accent/50 rounded"
        />
      </div>
      <div v-else class="flex justify-center text-muted-foreground p-4">Vehicles not found</div>
    </PopoverContent>
  </Popover>
</template>
