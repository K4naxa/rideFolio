<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import type {
  MaintenanceCategoryPart,
  MaintenanceCategoryWithParts,
  MaintenancePartInput,
  PartLocation,
  TAccessibleVehicle,
} from "@repo/validation";
import { computed, ref, watch } from "vue";

import ResponsiveCombobox from "@/components/forms/ResponsiveCombobox.vue";
import MobilePartSelection from "@/modals/Maintenance/components/MobilePartSelection.vue";
import { useMaintenancePartCategories } from "@/lib/queries/maintenances/maintenance-queries";
import { usePartCleaner } from "@/modals/Maintenance/composables/usePartCleaner";
import { toast } from "vue-sonner";
import { Empty } from "@/components/ui/empty";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import { timestamp } from "@vueuse/core";
import MaintenancePartFormItem from "@/modals/Maintenance/components/MaintenancePartFormItem.vue";
import { useFieldArray } from "vee-validate";

const props = defineProps<{
  selectedVehicle: TAccessibleVehicle | undefined;
}>();

const { fields, push, remove, replace, update } = useFieldArray<MaintenancePartInput>("parts");

const formParts = computed(() => fields.value.map((f) => f.value) || []);

const { data: partCategories, isLoading: partCategoriesLoading } = useMaintenancePartCategories(
  computed(() => props.selectedVehicle?.vehicleData.type.code),
);
const { cleanupPartsForVehicleType } = usePartCleaner();

const selectedCategory = ref<MaintenanceCategoryWithParts | null>(null);
const selectedPart = ref<MaintenanceCategoryPart | null>(null);

function addPart(part: MaintenanceCategoryPart | null) {
  if (!part) return;
  const newPart: MaintenancePartInput = {
    groupId: timestamp().toString(),
    partId: part.id,
    partCode: part.code,
    partNameKey: part.nameKey,
    categoryCode: selectedCategory.value?.code || "",
    categoryNameKey: selectedCategory.value?.nameKey || "",
    customName: null,
    description: "",
    label: "",
    locations: [] as PartLocation[],
  };

  push(newPart);
  selectedPart.value = null;
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

watch(
  () => selectedCategory.value,
  () => {
    selectedPart.value = null;
  },
);
</script>

<template>
  <div class="flex min-h-0 flex-col gap-4 overflow-hidden pt-3">
    <!-- part Creation -->
    <div>
      <section class="shrink-0">
        <div class="flex flex-col gap-4 lg:flex-row">
          <div class="flex-2">
            <ResponsiveCombobox
              :items="<MaintenanceCategoryWithParts[]>partCategories ?? []"
              label-key="code"
              :value-key="'id'"
              :isLoading="partCategoriesLoading"
              v-model="selectedCategory"
              :disabled="!selectedVehicle"
              placeholder="Select Category"
              description="Select a category to see available parts"
            >
              <template #item="{ item }">
                <span class="capitalize">{{ item.code }}</span>
              </template>
            </ResponsiveCombobox>
          </div>

          <div class="flex-2">
            <ResponsiveCombobox
              :search-keys="['code']"
              v-model="selectedPart"
              :items="<MaintenanceCategoryPart[]>selectedCategory?.parts ?? []"
              value-key="code"
              label-key="code"
              :disabled="!selectedCategory"
              placeholder="Select Part"
              description="Select a part to add to the maintenance"
            >
              <template #item="{ item }">
                <span>{{ item.code }}</span>
              </template>
            </ResponsiveCombobox>
          </div>

          <Button type="button" class="flex-1" @click="addPart(selectedPart)" :disabled="!selectedPart">Add</Button>
        </div>
      </section>
      <section class="mt-2 lg:hidden">
        <div>
          <MobilePartSelection
            :disabled="!selectedVehicle"
            :part-categories="partCategories"
            :is-loading="partCategoriesLoading"
          />
        </div>
      </section>
    </div>

    <!-- parts list -->

    <div class="scrollArea flex h-fit min-h-0 grow flex-col gap-2 overflow-y-auto lg:h-0">
      <Empty v-if="formParts.length === 0" class="text-muted-foreground my-auto text-center">
        <EmptyTitle>No parts added yet</EmptyTitle>
        <EmptyDescription>Add parts using the controls above to track serviced parts.</EmptyDescription>
      </Empty>

      <MaintenancePartFormItem
        v-for="part in formParts"
        :part="part"
        :partCategories="partCategories"
        @label-change="handleLabelChange"
        @location-toggle="handleLocationToggle"
        @remove="removePart"
        :key="part.groupId"
      />
    </div>
  </div>
</template>
