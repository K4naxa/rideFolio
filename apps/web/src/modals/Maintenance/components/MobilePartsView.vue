<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import type { MaintenancePartInput, PartLocation, TAccessibleVehicle } from "@repo/validation";
import { computed, watch } from "vue";

import MobilePartSelection from "@/modals/Maintenance/components/MobilePartSelection.vue";
import { useMaintenancePartCategories } from "@/lib/queries/maintenances/maintenance-queries";
import { usePartCleaner } from "@/modals/Maintenance/composables/usePartCleaner";
import { toast } from "vue-sonner";
import { Empty, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import MaintenancePartFormItem from "@/modals/Maintenance/components/MaintenancePartFormItem.vue";
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useFieldArray } from "vee-validate";

const props = defineProps<{ selectedVehicle: TAccessibleVehicle | undefined }>();
const emit = defineEmits<{ (event: "close"): void }>();

const { fields, push, remove, replace, update } = useFieldArray<MaintenancePartInput>("parts");

const { data: partCategories, isLoading: partCategoriesLoading } = useMaintenancePartCategories(
  computed(() => props.selectedVehicle?.vehicleData.type.code),
);
const { cleanupPartsForVehicleType } = usePartCleaner();

function addPart(part: MaintenancePartInput) {
  push(part);
}

function removePart(part: MaintenancePartInput) {
  remove(fields.value.findIndex((p) => p.value.groupId === part.groupId));
}

function handleLocationToggle(location: PartLocation, part: MaintenancePartInput) {
  if (!fields.value) return;
  const partIndex = fields.value.findIndex((p) => p.value.groupId === part.groupId);
  if (partIndex === -1 || partIndex === undefined) return;

  const field = fields.value[partIndex];
  if (!field) return;

  if (field.value.locations.some((loc) => loc.id === location.id)) {
    // Remove location
    const updatedLocations = field.value.locations.filter((loc) => loc.id !== location.id);
    update(partIndex, { ...field.value, locations: updatedLocations });
  } else {
    // Add location
    const updatedLocations = [...field.value.locations, location];
    update(partIndex, { ...field.value, locations: updatedLocations });
  }
}

function handleLabelChange(event: Event, part: MaintenancePartInput) {
  if (!fields.value) return;
  const partIndex = fields.value.findIndex((p) => p.value.groupId === part.groupId);
  if (partIndex === -1 || partIndex === undefined) return;

  const field = fields.value[partIndex];
  if (!field) return;

  const newLabel = (event.target as HTMLInputElement).value;
  update(partIndex, { ...field.value, label: newLabel });
}

watch(
  () => partCategories.value,
  (newCategories, oldCategories) => {
    // skip on the initial load
    if (!newCategories || oldCategories?.length === 0) return;

    const oldParts = fields.value.map((f) => f.value) || [];

    const oldPartsCount = oldParts.length || 0;
    const cleanedParts = cleanupPartsForVehicleType(oldParts, newCategories);
    const newPartsCount = cleanedParts.length;

    replace(cleanedParts);

    if (oldPartsCount !== newPartsCount) {
      toast.warning("Some parts were removed as they are not compatible with the selected vehicle type.");
    }
  },
);
</script>

<template>
  <div class="">
    <DrawerHeader>
      <DrawerTitle class="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" @click="emit('close')" class="shrink-0">
          <Icon name="arrowLeft" class="h-4 w-4" />
        </Button>
        Serviced Parts
      </DrawerTitle>
      <DrawerDescription> Add parts that were serviced during this maintenance. </DrawerDescription>
    </DrawerHeader>

    <!-- parts list -->
    <div class="gaps-sm flex min-h-96 flex-col overflow-y-auto overscroll-contain px-3">
      <Empty v-if="fields.length === 0" class="text-muted-foreground my-auto text-center">
        <EmptyHeader>
          <EmptyMedia variant="icon" class="text-maintenance">
            <Icon name="maintenance" />
          </EmptyMedia>
          <EmptyTitle>No parts added yet</EmptyTitle>
          <EmptyDescription>Add parts to see them listed here</EmptyDescription>
        </EmptyHeader>
      </Empty>

      <MaintenancePartFormItem
        v-for="part in fields.map((f) => f.value)"
        :part="part"
        :partCategories="partCategories"
        @label-change="handleLabelChange"
        @location-toggle="handleLocationToggle"
        @remove="removePart"
        :key="part.groupId"
      />
    </div>

    <DrawerFooter>
      <MobilePartSelection
        @addPart="addPart"
        :partCategories="partCategories ?? []"
        :isLoading="partCategoriesLoading"
      />
    </DrawerFooter>
  </div>
</template>
