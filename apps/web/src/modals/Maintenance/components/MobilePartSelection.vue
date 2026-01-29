<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PartsFieldKey } from "@/modals/Maintenance/composables/injection-keys";
import {
  type MaintenanceCategoryPart,
  type MaintenanceCategoryWithParts,
  type MaintenancePartInput,
  type PartLocation,
} from "@repo/validation";
import { timestamp } from "@vueuse/core";
import { twMerge } from "tailwind-merge";
import { inject, ref } from "vue";

interface Props {
  partCategories: MaintenanceCategoryWithParts[] | undefined;
  isLoading: boolean;
}

const props = defineProps<Props>();

const partsField = inject(PartsFieldKey);
if (!partsField) {
  throw new Error("MobilePartSelection must be used within a form that provides PartsFieldKey");
}

const newPart = ref<MaintenancePartInput>({
  groupId: "",
  partId: "",
  partCode: "",
  partNameKey: "",
  categoryCode: "",
  categoryNameKey: "",
  customName: "",
  locations: [],
});

function resetNewPart() {
  newPart.value = {
    groupId: "",
    partId: "",
    partCode: "",
    partNameKey: "",
    categoryCode: "",
    categoryNameKey: "",
    customName: "",
    label: "",
    locations: [],
  };
}

const selectedCategory = ref<MaintenanceCategoryWithParts | null>(null);
const selectedPart = ref<MaintenanceCategoryPart | null>(null);
const isDrawerOpen = ref(false);

const customNameInput = ref<string>("");

function selectCategory(category: MaintenanceCategoryWithParts | null) {
  selectedCategory.value = category;
  newPart.value = {
    ...newPart.value,
    categoryCode: category ? category.code : "",
    categoryNameKey: category ? category.nameKey : "",
  };
}
function selectPart(part: MaintenanceCategoryPart | null) {
  selectedPart.value = part;
  newPart.value = {
    ...newPart.value,
    groupId: timestamp().toString(),
    partId: part ? part.id : "",
    partCode: part ? part.code : "",
    partNameKey: part ? part.nameKey : "",
    customName: "",
    label: "",
    locations: [],
  };
}

function openDrawer() {
  isDrawerOpen.value = true;
}

function handleLocationToggle(location: PartLocation) {
  if (!newPart.value) return;

  const exists = newPart.value.locations.find((loc) => loc.id === location.id);
  if (exists) {
    newPart.value.locations = newPart.value.locations.filter((loc) => loc.id !== location.id);
  } else {
    newPart.value.locations.push(location);
  }
}

function addPart() {
  if (!newPart.value.partId) return;
  partsField?.push({ ...newPart.value });

  resetNewPart();
  selectedCategory.value = null;
  selectedPart.value = null;
  isDrawerOpen.value = false;
}
</script>

<template>
  <Drawer v-model:open="isDrawerOpen">
    <DrawerTrigger as-child>
      <Button type="button" @click="openDrawer" class="w-full"> Add part v2 </Button>
    </DrawerTrigger>

    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>
          <span v-if="!selectedCategory"> Select Category </span>
          <span v-else-if="!selectedPart"> Select Part </span>
          <span v-else> Part Details </span>
        </DrawerTitle>
        <DrawerDescription>
          <span v-if="!selectedCategory"> Choose a part category </span>
          <span v-else-if="!selectedPart"> Select a part from {{ selectedCategory.code }} </span>
          <span v-else> Set location and custom details </span>
        </DrawerDescription>
        <Separator class="mt-1" />
      </DrawerHeader>

      <!-- Step 1: Select Category -->
      <section v-if="!selectedCategory" class="px-4">
        <div class="mb-2">
          <span class="text-muted-foreground text-sm"> Select a category to see available parts </span>
        </div>

        <div class="mb-4 grid grid-cols-2 gap-2.5">
          <Button
            variant="outline"
            type="button"
            class="flex h-fit flex-col items-start gap-1 p-4"
            v-for="category in partCategories"
            :key="category.id"
            @click="selectCategory(category)"
            v-if="!selectedCategory"
          >
            <Label>{{ category.code }}</Label>
            <span class="text-muted-foreground text-sm">{{ category.parts.length }} parts</span>
          </Button>
        </div>
      </section>

      <!-- Step 2: Select Part -->
      <section v-else-if="!selectedPart" class="px-4">
        <div class="mb-4 flex items-center gap-4">
          <Button variant="outline" type="button" @click="selectCategory(null)">
            <Icon name="chevronLeft" /> Back</Button
          >
          <Label class="text-muted-foreground text-base"> {{ selectedCategory.code }} </Label>
        </div>

        <div class="space-y-3">
          <Button
            type="button"
            variant="outline"
            v-for="part in selectedCategory.parts"
            @click="selectPart(part)"
            :key="part.id"
            class="flex h-fit w-full items-center justify-between py-3"
          >
            <span>{{ part.code }}</span>
            <Icon name="chevronRight" />
          </Button>
        </div>
      </section>

      <!-- Step 3: Part details -->
      <section v-else class="space-y-4 px-4">
        <div class="mb-4 flex items-center gap-4">
          <Button variant="outline" type="button" @click="selectPart(null)"> <Icon name="chevronLeft" /> Back</Button>
          <Label class="text-muted-foreground text-base"> {{ selectedPart.code }} </Label>
        </div>

        <!-- Location details -->
        <div v-if="selectedPart.validLocations && selectedPart.validLocations.length > 0" class="space-y-2">
          <h4>Locations</h4>
          <ul class="flex gap-4">
            <Button
              v-for="location in selectedPart.validLocations"
              :key="location.id"
              type="button"
              variant="outline"
              :class="
                twMerge(
                  'flex-1 justify-center',
                  newPart.locations.includes(location) ? 'bg-primary! text-primary-foreground!' : '',
                )
              "
              @click="handleLocationToggle(location)"
            >
              <span>
                {{
                  location.code
                    .split("_")
                    .map((word) => word[0]?.toUpperCase() || "")
                    .join("")
                }}
              </span>
            </Button>
          </ul>
          <div class="text-muted-foreground flex justify-between text-xs">
            <span>FL = Front Left</span>
            <span>FR = Front Right</span>
            <span>RL = Rear Left</span>
            <span>RR = Rear Right</span>
          </div>
        </div>

        <!-- Custom Details -->
        <div>
          <h3>Custom Details</h3>
          <input type="text" class="inputField" placeholder="eg, Part name" v-model="newPart.label" />
        </div>

        <Button type="button" @click="addPart" variant="default" class="h-fit w-full">
          <Icon name="check" /> Add {{ selectedPart.code }}</Button
        >
      </section>

      <DrawerFooter class="">
        <DrawerClose as-child>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
