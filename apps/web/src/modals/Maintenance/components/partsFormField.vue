<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";

import Label from "@/components/ui/label/Label.vue";
import type {
  MaintenanceCategoryPart,
  MaintenanceCategoryWithParts,
  MaintenancePartInput,
  PartLocation,
  TAccessibleVehicle,
} from "@repo/validation";
import { computed, inject, ref, watch, watchEffect } from "vue";

import ResponsiveCombobox from "@/components/forms/ResponsiveCombobox.vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import MobilePartSelection from "@/modals/Maintenance/components/MobilePartSelection.vue";
import { useMaintenancePartCategories } from "@/lib/queries/maintenances/maintenance-queries";
import { usePartCleaner } from "@/modals/Maintenance/composables/usePartCleaner";
import { toast } from "vue-sonner";
import { Empty } from "@/components/ui/empty";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { twMerge } from "tailwind-merge";
import { timestamp } from "@vueuse/core";
import { PartsFieldKey } from "@/modals/Maintenance/composables/injection-keys";
import { Popover } from "@/components/ui/popover";
import PopoverTrigger from "@/components/ui/popover/PopoverTrigger.vue";
import PopoverContent from "@/components/ui/popover/PopoverContent.vue";

const props = defineProps<{
  selectedVehicle: TAccessibleVehicle | undefined;
}>();

const partsField = inject(PartsFieldKey);
if (!partsField) {
  throw new Error("MobilePartSelection must be used within a form that provides PartsFieldKey");
}
const formParts = computed(() => partsField.fields.value.map((f) => f.value) || []);

const { data: partCategories, isLoading: partCategoriesLoading } = useMaintenancePartCategories(
  computed(() => props.selectedVehicle?.vehicleData.type.code),
);
const { cleanupPartsForVehicleType } = usePartCleaner();

const selectedCategory = ref<MaintenanceCategoryWithParts | null>(null);
const selectedPart = ref<MaintenanceCategoryPart | null>(null);
const customTypeInput = ref<string>("");
const isMobile = useIsMobile();

function getPossibleLocations(part: MaintenancePartInput): PartLocation[] {
  return (
    partCategories.value?.flatMap((category) => category.parts).find((p) => p.id === part.partId)?.validLocations || []
  );
}

function isLocationSelected(location: PartLocation, part: MaintenancePartInput): boolean {
  return part.locations.some((loc) => loc.id === location.id);
}

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

  partsField?.push(newPart);
  selectedPart.value = null;
}

function removePart(part: MaintenancePartInput) {
  partsField?.remove(partsField.fields.value.findIndex((p) => p.value.groupId === part.groupId));
}

function handleLocationToggle(location: PartLocation, part: MaintenancePartInput) {
  if (!partsField) return;
  const partIndex = partsField.fields.value.findIndex((p) => p.value.groupId === part.groupId);
  if (partIndex === -1 || partIndex === undefined) return;

  const field = partsField.fields.value[partIndex];
  if (!field) return;

  if (field.value.locations.some((loc) => loc.id === location.id)) {
    // Remove location
    const updatedLocations = field.value.locations.filter((loc) => loc.id !== location.id);
    partsField?.update(partIndex, { ...field.value, locations: updatedLocations });
  } else {
    // Add location
    const updatedLocations = [...field.value.locations, location];
    partsField?.update(partIndex, { ...field.value, locations: updatedLocations });
  }
}

function handleLabelChange(event: Event, part: MaintenancePartInput) {
  if (!partsField) return;
  const partIndex = partsField.fields.value.findIndex((p) => p.value.groupId === part.groupId);
  if (partIndex === -1 || partIndex === undefined) return;

  const field = partsField.fields.value[partIndex];
  if (!field) return;

  const newLabel = (event.target as HTMLInputElement).value;
  partsField?.update(partIndex, { ...field.value, label: newLabel });
}

watch(
  () => partCategories.value,
  (newCategories, oldCategories) => {
    // skip on initial load
    if (!newCategories || oldCategories?.length === 0) return;

    const oldParts = partsField?.fields.value.map((f) => f.value) || [];

    const oldPartsCount = oldParts.length || 0;
    const cleanedParts = cleanupPartsForVehicleType(oldParts, newCategories);
    const newPartsCount = cleanedParts.length;

    partsField?.replace(cleanedParts);

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
          <MobilePartSelection :part-categories="partCategories" :is-loading="partCategoriesLoading" />
        </div>
      </section>
    </div>

    <!-- parts list -->

    <div class="scrollArea flex h-fit min-h-0 grow flex-col gap-2 overflow-y-auto lg:h-0">
      <Empty v-if="formParts.length === 0" class="text-muted-foreground my-auto text-center">
        <EmptyTitle>No parts added yet</EmptyTitle>
        <EmptyDescription>Add parts using the controls above to track serviced parts.</EmptyDescription>
      </Empty>

      <div v-for="part in formParts" :key="part.groupId" class="bg-card mr-1 rounded border p-2.5">
        <div class="flex w-full items-center gap-3">
          <h3 class="truncate">{{ part.partCode }}</h3>
          <Badge variant="outline" class="bg-muted text-muted-foreground border-none text-sm">
            {{ part.categoryCode }}
          </Badge>
          <Popover v-if="getPossibleLocations(part).length > 0">
            <PopoverTrigger>
              <Badge v-if="part.locations.length === 0" variant="outline" class="h-full cursor-pointer">
                select locations
              </Badge>
              <Badge v-else variant="outline" class="h-full cursor-pointer">
                <span v-for="loc in part.locations" class="text-primary text-sm">
                  {{
                    loc.code
                      .split("_")
                      .map((word) => word[0]?.toUpperCase() || "")
                      .join("")
                  }}
                </span>
              </Badge>
            </PopoverTrigger>
            <PopoverContent class="p-2" side="bottom" align="start">
              <div class="grid grid-cols-2 gap-2">
                <Button
                  v-for="loc in getPossibleLocations(part)"
                  type="button"
                  variant="outline"
                  :class="
                    twMerge(
                      'flex-1 justify-center',
                      isLocationSelected(loc, part) ? 'bg-primary! text-primary-foreground!' : '',
                    )
                  "
                  @click="handleLocationToggle(loc, part)"
                  :key="loc.id"
                >
                  <span>
                    {{
                      loc.code
                        .split("_")
                        .map((word) => word[0]?.toUpperCase() || "")
                        .join("")
                    }}
                  </span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            type="button"
            size="icon-sm"
            @click="removePart(part)"
            aria-label="Remove part"
            class="group ml-auto"
          >
            <Icon name="trash" class="text-muted-foreground group-hover:text-destructive size-4 duration-200" />
          </Button>
        </div>
        <div class="flex items-center gap-3">
          <input
            type="text"
            placeholder="Add custom name / details"
            name="customName"
            id="customName"
            class="text-foreground/80 mt-1 w-full rounded-none bg-transparent text-base outline-0 focus:ring-0"
            :value="part.label"
            @input="handleLabelChange($event, part)"
          />
        </div>
        <div class="mt-4 flex flex-col" v-if="getPossibleLocations(part).length > 0">
          <span class="text-muted-foreground text-sm"> Select locations:</span>
          <div class="mt-2 flex justify-between gap-2">
            <Button
              v-for="loc in getPossibleLocations(part)"
              type="button"
              variant="outline"
              :class="
                twMerge(
                  'flex-1 justify-center',
                  isLocationSelected(loc, part) ? 'bg-primary! text-primary-foreground!' : '',
                )
              "
              @click="handleLocationToggle(loc, part)"
              :key="loc.id"
            >
              <span>
                {{
                  loc.code
                    .split("_")
                    .map((word) => word[0]?.toUpperCase() || "")
                    .join("")
                }}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
