<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

import Label from "@/components/ui/label/Label.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useMaintenancePartCategories } from "@/lib/queries/maintenances/maintenance-queries";
import type {
  TAccessibleVehicle,
  TMaintenanceCategory,
  TMaintenanceCategoryPart,
  TMaintenanceFormPart,
} from "@repo/validation";
import { computed, ref, watch } from "vue";
import { usePartCleaner } from "../composables/usePartCleaner";
import { toast } from "vue-sonner";

interface PartDisplay {
  groupId: string;
  code: TMaintenanceFormPart["code"];
  nameKey: TMaintenanceCategoryPart["nameKey"];
  label: TMaintenanceFormPart["label"];
  locations: TMaintenanceFormPart["validLocations"];
  instances: TMaintenanceFormPart[];
}

const props = defineProps<{
  selectedVehicle?: TAccessibleVehicle;
  values: TMaintenanceFormPart[];
}>();
const emits = defineEmits<{
  (e: "update:values", value: TMaintenanceFormPart[]): void;
}>();

const selectedVehicleType = computed(() => props.selectedVehicle?.vehicleData.type.code || undefined);

const selectedCategory = ref<TMaintenanceCategory | null>(null);
const selectedPart = ref<TMaintenanceCategoryPart | null>(null);
const customTypeInput = ref<string>("");

const { data: partCategories, isLoading: partCategoriesLoading } = useMaintenancePartCategories(selectedVehicleType);
const { cleanupPartsForVehicleType } = usePartCleaner();

const displayParts = computed<PartDisplay[]>(() => {
  const parts = props.values || [];
  const partMap = new Map<string, PartDisplay>();

  for (const part of parts) {
    if (!part.groupId) throw new Error("Part is missing groupId");
    if (!partMap.has(part.groupId)) {
      partMap.set(part.groupId, {
        groupId: part.groupId,
        code: part.code,
        nameKey: part.nameKey,
        label: part.label,
        locations: part.validLocations,
        instances: [part],
      });
    } else {
      partMap.get(part.groupId)?.instances.push(part);
    }
  }
  return Array.from(partMap.values());
});

function handleAddPart() {
  if (!selectedPart.value) return;

  const newPart: TMaintenanceFormPart = {
    groupId: Date.now().toString(),
    partId: selectedPart.value.id,
    nameKey: selectedPart.value.nameKey,
    locationId: null,
    code: selectedPart.value.code,
    label: null,
    description: null,
    validLocations: selectedPart.value.validLocations,
    customPartLabel: customTypeInput.value || null,
  };

  const currentParts = props.values || [];

  emits("update:values", [...currentParts, newPart]);
  // Reset selections

  selectedPart.value = null;
  customTypeInput.value = "";
}

function handleLocationToggle(locationId: string, groupId: string) {
  const partGroup = props.values.filter((part) => part.groupId === groupId);

  if (partGroup.length === 0) return;

  const existingPartWithLocation = partGroup.find((part) => part.locationId === locationId);

  // If location is already selected, remove or nullify it
  if (existingPartWithLocation) {
    if (partGroup.length === 1) {
      // Only instance - set locationId to null
      const updatedParts = props.values.map((part) =>
        part.groupId === groupId ? { ...part, locationId: null } : part,
      );
      emits("update:values", updatedParts);
    } else {
      // Multiple instances - remove this specific one
      const updatedParts = props.values.filter((part) => !(part.groupId === groupId && part.locationId === locationId));
      emits("update:values", updatedParts);
    }
    return;
  }

  // Location is not selected - add or update
  const partWithoutLocation = partGroup.find((part) => part.locationId === null);

  if (partWithoutLocation) {
    // Update existing part without location
    const updatedParts = props.values.map((part) => (part === partWithoutLocation ? { ...part, locationId } : part));
    emits("update:values", updatedParts);
  } else {
    if (!partGroup[0]) return;
    // Create new instance
    const newPart: TMaintenanceFormPart = {
      ...partGroup[0],
      locationId,
    };
    emits("update:values", [...props.values, newPart]);
  }
}

function handeLabelUpdate(newLabel: string, groupId: string) {
  const updatedParts = props.values.map((part) => {
    if (part.groupId === groupId) {
      return {
        ...part,
        label: newLabel,
      };
    }
    return part;
  });
  emits("update:values", updatedParts);
}

function handleDeletePart(groupId: string) {
  const updatedParts = props.values.filter((part) => part.groupId !== groupId);
  emits("update:values", updatedParts);
}

watch(
  () => selectedCategory.value,
  () => {
    selectedPart.value = null;
  },
);
watch(
  () => partCategories.value,
  (newCategories, oldCategories) => {
    if (!newCategories) return;
    if (oldCategories === undefined) return;

    selectedCategory.value = null;
    selectedPart.value = null;

    const oldPartsCount = props.values.length;

    const cleanedParts = cleanupPartsForVehicleType(props.values, newCategories);
    const newPartsCount = cleanedParts.length;

    if (oldPartsCount !== newPartsCount) {
      toast.warning("Some parts were removed as they are not compatible with the newly selected vehicle type.");
    }

    emits("update:values", cleanedParts);
  },
);
</script>

<template>
  <div class="flex max-h-full min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-hidden pt-3 lg:h-full">
    <!-- part Creation -->
    <div class="flex flex-col gap-4 lg:flex-row">
      <div class="flex-2">
        <Combobox
          v-model="selectedCategory"
          by="code"
          open-on-click
          reset-search-term-on-select
          :disabled="!selectedVehicle"
        >
          <ComboboxAnchor>
            <div class="inputField">
              <ComboboxInput
                placeholder="Select category"
                class="w-full"
                :display-value="(val: TMaintenanceCategory | null) => val?.code ?? ''"
              />
            </div>
          </ComboboxAnchor>
          <ComboboxList>
            <ComboboxEmpty v-if="partCategoriesLoading" class=""
              ><span class="flex w-full gap-2"><Spinner />Loading...</span></ComboboxEmpty
            >
            <ComboboxEmpty class="text-muted-foreground"> No categories found. </ComboboxEmpty>
            <ComboboxGroup>
              <ComboboxItem
                v-for="category in partCategories"
                :key="category.id"
                :value="category"
                :class="selectedCategory?.id === category.id && 'bg-accent/50'"
              >
                <p class="capitalize">{{ category.code }}</p>
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>
      </div>

      <div class="flex-2">
        <Combobox
          v-model="selectedPart"
          by="code"
          open-on-click
          reset-search-term-on-select
          :disabled="!selectedCategory || !selectedVehicle"
        >
          <ComboboxAnchor>
            <div class="inputField">
              <ComboboxInput
                placeholder="Select part"
                :display-value="(val: TMaintenanceCategoryPart) => val?.code ?? ''"
              />
            </div>
          </ComboboxAnchor>
          <ComboboxList>
            <ComboboxEmpty> No categories found. </ComboboxEmpty>
            <ComboboxGroup>
              <ComboboxItem
                v-for="part in selectedCategory?.parts"
                :key="part.id"
                :value="part"
                :class="selectedPart?.id === part.id && 'bg-accent/50'"
              >
                {{ part.code }}
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>
      </div>

      <Button type="button" class="flex-1" @click="handleAddPart" :disabled="!selectedPart">Add</Button>
    </div>

    <!-- parts list -->
    <div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded border lg:max-h-full">
      <!-- header -->
      <div
        class="text-accent-foreground bg-accent/20 grid h-10 grid-cols-[minmax(16rem,1fr)_12rem_2rem] gap-4 border-b px-3 text-sm font-medium"
      >
        <Label>Part</Label>
        <Label>Locations</Label>
        <div></div>
      </div>
      <!-- content -->
      <ul
        v-auto-animate
        class="scrollbar divide-border flex max-h-96 min-h-24 flex-1 flex-col divide-y overflow-y-auto p-1.5 lg:overflow-x-hidden"
      >
        <span v-if="displayParts.length < 1" class="text-muted-foreground my-auto text-center"
          >Add serviced parts to the list to see them here</span
        >
        <li
          v-for="part in displayParts"
          :key="part.groupId"
          class="my-2 grid grid-cols-[minmax(12rem,1fr)_12rem_2rem] items-center gap-4 px-2 py-1.5"
        >
          <!-- part code / label -->
          <div>
            <input
              type="text"
              :placeholder="part.code"
              :value="part.label"
              @input="handeLabelUpdate(($event.target as HTMLInputElement).value, part.groupId)"
              class="w-full bg-transparent py-1 text-sm outline-0 focus-visible:outline-0"
            />
            <span v-if="part.label" class="text-muted-foreground text-xs">{{ part.code }}</span>
          </div>

          <!-- locations -->
          <div class="flex gap-0.5">
            <Button
              variant="outline"
              size="sm"
              @click.prevent="handleLocationToggle(loc.id, part.groupId)"
              :class="
                part.instances.some((instance) => instance.locationId === loc.id)
                  ? 'bg-primary/50! text-accent-foreground'
                  : ''
              "
              v-for="loc in part.locations"
              :key="loc.code"
            >
              {{
                loc.code
                  .split("_")
                  .map((word) => word[0]?.toUpperCase() || "")
                  .join("")
              }}
            </Button>
          </div>
          <Button variant="outline" size="icon" @click.prevent="handleDeletePart(part.groupId)">
            <Icon name="trash" />
          </Button>
        </li>
      </ul>
    </div>
  </div>
</template>
