<script setup lang="ts">
import { computed, type HTMLAttributes, ref } from "vue";
import Button from "../ui/button/Button.vue";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Icon from "@/components/icons/Icon.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import Empty from "@/components/ui/empty/Empty.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import Drawer from "@/components/ui/drawer/Drawer.vue";
import DrawerTrigger from "@/components/ui/drawer/DrawerTrigger.vue";
import DrawerContent from "@/components/ui/drawer/DrawerContent.vue";
import DrawerHeader from "@/components/ui/drawer/DrawerHeader.vue";
import DrawerTitle from "@/components/ui/drawer/DrawerTitle.vue";
import DrawerDescription from "@/components/ui/drawer/DrawerDescription.vue";
import VehicleItem from "@/components/vehicles/VehicleItem.vue";
import DrawerFooter from "@/components/ui/drawer/DrawerFooter.vue";
import DrawerClose from "@/components/ui/drawer/DrawerClose.vue";
import { twMerge } from "tailwind-merge";

interface VehicleSelectProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  title?: string;
  description?: string;
  triggerClass?: HTMLAttributes["class"];
  contentClass?: HTMLAttributes["class"];
}
const props = defineProps<VehicleSelectProps>();
const emit = defineEmits<{
  valueChange: [value: string];
}>();

const isMobile = useIsMobile();
const isOpen = ref(false);
const search = ref<string>("");
const filteredVehicles = computed(() => {
  const searchLower = search.value.toLowerCase();
  if (!vehicles?.value) return [];

  return vehicles.value.filter(
    ({ vehicleData }) =>
      vehicleData.name.toLowerCase().includes(searchLower) ||
      vehicleData.licensePlate?.toLowerCase().includes(searchLower) ||
      vehicleData.model?.toLowerCase().includes(searchLower) ||
      vehicleData.make?.toLowerCase().includes(searchLower),
  );
});

const { data: vehicles } = useVehiclesAll();

const selectedVehicle = computed(() => vehicles?.value?.find((vehicle) => vehicle.vehicleData.id === props.value));

function handleSelect(value: string) {
  console.log("Selected vehicle ID:", value);
  emit("valueChange", value);
  isOpen.value = false;
}
</script>

<template>
  <!-- Desktop Dropdown-->
  <template v-if="!isMobile">
    <DropdownMenu v-model:open="isOpen">
      <DropdownMenuTrigger class="w-full">
        <button
          v-if="selectedVehicle"
          type="button"
          :class="twMerge('inputField h-fit w-full p-1!', props.triggerClass)"
        >
          <VehicleItem :vehicle="selectedVehicle.vehicleData" variant="small" />
          <Icon name="chevronDown" class="text-muted-foreground mr-2" />
        </button>
        <button v-else type="button" :class="twMerge('inputField h-fit w-full p-1!', props.triggerClass)">
          <span class="text-muted-foreground py-2">{{ placeholder }}</span>
          <Icon name="chevronDown" class="text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent :class="contentClass" same-width align="start">
        <ul v-if="filteredVehicles.length > 0" class="scrollbar-macos max-h-72 w-full space-y-2 overflow-y-auto">
          <li
            v-for="vehicle in filteredVehicles"
            v-bind:key="vehicle.vehicleData.id"
            @click="handleSelect(vehicle.vehicleData.id)"
            class="listHover flex cursor-pointer items-center justify-between rounded select-none"
          >
            <VehicleItem
              variant="small"
              :is-active="vehicle.vehicleData.id === props.value"
              :key="vehicle.vehicleData.id"
              :vehicle="vehicle.vehicleData"
              class=""
            />
            <Icon
              name="check"
              v-if="selectedVehicle?.vehicleData.id === vehicle.vehicleData.id"
              class="text-muted-foreground mr-2"
            />
          </li>
        </ul>
        <Empty v-else class="p-12!">
          <EmptyDescription class="">Vehicles not found</EmptyDescription>
        </Empty>
      </DropdownMenuContent>
    </DropdownMenu>
  </template>

  <!-- Mobile Drawer -->
  <template v-else>
    <Drawer v-model:open="isOpen">
      <DrawerTrigger as-child>
        <Button
          variant="outline"
          v-if="selectedVehicle"
          type="button"
          :class="twMerge('h-fit w-full p-0!', props.triggerClass)"
        >
          <VehicleItem :vehicle="selectedVehicle.vehicleData" variant="small" />
          <Icon name="chevronDown" class="text-muted-foreground mr-2" />
        </Button>
        <Button variant="outline" v-else type="button" :class="twMerge('h-fit w-full p-0!', props.triggerClass)">
          <span class="text-muted-foreground py-2">{{ placeholder }}</span>
          <Icon name="chevronDown" class="text-muted-foreground" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader class="text-left">
          <DrawerTitle>Select a Vehicle</DrawerTitle>
          <DrawerDescription v-if="description"> {{ description }} </DrawerDescription>
        </DrawerHeader>
        <ul v-if="filteredVehicles.length > 0" class="px-3 pb-4">
          <li
            v-for="vehicle in filteredVehicles"
            :key="vehicle.vehicleData.id"
            @click="handleSelect(vehicle.vehicleData.id)"
            class="bg-card flex cursor-pointer items-center justify-between gap-2 rounded"
          >
            <VehicleItem
              variant="small"
              :is-active="vehicle.vehicleData.id === props.value"
              :key="vehicle.vehicleData.id"
              :vehicle="vehicle.vehicleData"
              class=""
            />
            <Icon
              name="check"
              v-if="selectedVehicle?.vehicleData.id === vehicle.vehicleData.id"
              class="text-muted-foreground mr-2"
            />
          </li>
        </ul>
        <DrawerFooter>
          <DrawerClose as-child>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </template>
</template>
