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

interface VehicleSelectProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  canCreateValidation?: boolean;
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

  const filtered = vehicles.value.filter(
    ({ vehicleData }) =>
      vehicleData.name.toLowerCase().includes(searchLower) ||
      vehicleData.licensePlate?.toLowerCase().includes(searchLower) ||
      vehicleData.model?.toLowerCase().includes(searchLower) ||
      vehicleData.make?.toLowerCase().includes(searchLower),
  );

  if (props.canCreateValidation) {
    return filtered.filter((v) => v.canCreateLogs);
  }

  return filtered;
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
        <Button variant="outline" v-if="selectedVehicle" type="button" class="h-fit w-full p-1!">
          <VehicleItem :vehicle="selectedVehicle.vehicleData" variant="small" />
          <Icon name="chevronDown" class="text-muted-foreground mr-2" />
        </Button>
        <Button variant="outline" v-else type="button" class="h-fit w-full p-1!">
          <span class="text-muted-foreground py-2">{{ placeholder }}</span>
          <Icon name="chevronDown" class="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent :class="contentClass" same-width align="start">
        <div v-if="filteredVehicles.length > 0" class="scrollbar-macos max-h-72 w-full space-y-2 overflow-y-auto">
          <div
            v-for="vehicle in filteredVehicles"
            key="vehicle.vehicleData.id"
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
          </div>
        </div>
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
        <Button variant="outline" v-if="selectedVehicle" type="button" class="h-fit w-full p-1!">
          <VehicleItem :vehicle="selectedVehicle.vehicleData" variant="small" />
          <Icon name="chevronDown" class="text-muted-foreground mr-2" />
        </Button>
        <Button variant="outline" v-else type="button" class="h-fit w-full p-1!">
          <span class="text-muted-foreground py-2">{{ placeholder }}</span>
          <Icon name="chevronDown" class="text-muted-foreground" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader class="text-left">
          <DrawerTitle>Select a Vehicle</DrawerTitle>
          <DrawerDescription v-if="description"> {{ description }} </DrawerDescription>
        </DrawerHeader>
        <ul v-if="filteredVehicles.length > 0" class="divide-y px-4 pb-4">
          <div
            v-for="vehicle in filteredVehicles"
            @click="handleSelect(vehicle.vehicleData.id)"
            class="flex cursor-pointer items-center justify-between gap-2"
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
          </div>
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
