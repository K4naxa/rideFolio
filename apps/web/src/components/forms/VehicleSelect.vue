<script setup lang="ts">
import { computed, ref, type HTMLAttributes } from "vue";
import Popover from "../ui/popover/Popover.vue";
import PopoverTrigger from "../ui/popover/PopoverTrigger.vue";
import Button from "../ui/button/Button.vue";
import VehicleSelectItem from "@/components/forms/VehicleSelectItem.vue";
import { ChevronsUpDown } from "lucide-vue-next";
import PopoverContent from "@/components/ui/popover/PopoverContent.vue";
import Separator from "../ui/separator/Separator.vue";
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
  emit("valueChange", value);
  isOpen.value = false;
}
</script>

<template>
  <DropdownMenu v-if="!isMobile" v-model:open="isOpen">
    <DropdownMenuTrigger class="w-full">
      <Button variant="outline" :class="['h-fit w-full p-1!']">
        <VehicleSelectItem v-if="selectedVehicle" :vehicle="selectedVehicle.vehicleData" class="w-full" />
        <span v-else class="text-muted-foreground py-2">{{ placeholder }}</span>
        <Icon name="chevronDown" class="text-muted-foreground mr-1.5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent :class="contentClass" same-width align="start">
      <div v-if="filteredVehicles.length > 0" class="scrollbar max-h-72 w-full space-y-1 overflow-y-auto">
        <VehicleSelectItem
          v-for="vehicle in filteredVehicles"
          :is-active="vehicle.vehicleData.id === props.value"
          :key="vehicle.vehicleData.id"
          :vehicle="vehicle.vehicleData"
          @click="handleSelect(vehicle.vehicleData.id)"
          class="hover:bg-accent/50 rounded"
        />
      </div>
      <Empty v-else class="p-12!">
        <EmptyDescription class="">Vehicles not found</EmptyDescription>
      </Empty>
    </DropdownMenuContent>
  </DropdownMenu>

  <Drawer v-else v-model:open="isOpen">
    <DrawerTrigger as-child>
      <Button variant="outline" :class="['h-fit w-full p-1.5!']">
        <VehicleSelectItem v-if="selectedVehicle" :vehicle="selectedVehicle.vehicleData" class="w-full" />
        <span v-else class="text-muted-foreground py-2">{{ placeholder }}</span>
        <Icon name="chevronDown" class="text-muted-foreground" />
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader class="text-left">
        <DrawerTitle>Select a Vehicle</DrawerTitle>
        <DrawerDescription v-if="description"> {{ description }} </DrawerDescription>
      </DrawerHeader>
      <div class="px-4 pb-4">
        <div v-if="filteredVehicles.length > 0">
          <VehicleSelectItem
            v-for="vehicle in filteredVehicles"
            :key="vehicle.vehicleData.id"
            :is-active="vehicle.vehicleData.id === props.value"
            :vehicle="vehicle.vehicleData"
            @click="handleSelect(vehicle.vehicleData.id)"
            class="hover:bg-accent/50 rounded"
          />
        </div>
      </div>
    </DrawerContent>
  </Drawer>

  <!-- <Popover :open="open" @update:open="(value) => (open = value)" key="VehicleSelect">
    <PopoverTrigger asChild>
      <Button variant="outline" role="combobox" class="h-fit w-full p-1!" :aria-expanded="open">
        <VehicleSelectItem v-if="selectedVehicle" :vehicle="selectedVehicle.vehicleData" class="w-full" />
        <span v-else class="text-muted-foreground py-2">{{ placeholder }}</span>
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-(--reka-popover-trigger-width) p-0" align="start" key="VehicleSelectContent">
      <input
        type="search"
        v-model="search"
        placeholder="Search"
        autofocus="false"
        class="bg-background w-full rounded border-none px-3 py-2 outline-none focus-visible:ring-0"
      />
      <Separator />
      <div v-if="filteredVehicles.length > 0" class="scrollbar max-h-72 space-y-1 overflow-y-auto p-2">
        <VehicleSelectItem
          v-for="vehicle in filteredVehicles"
          :key="vehicle.vehicleData.id"
          :vehicle="vehicle.vehicleData"
          @click="handleSelect(vehicle.vehicleData.id)"
          class="hover:bg-accent/50 rounded"
        />
      </div>
      <div v-else class="text-muted-foreground flex justify-center p-4">Vehicles not found</div>
    </PopoverContent>
  </Popover> -->
</template>
