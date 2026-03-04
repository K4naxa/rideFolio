<script setup lang="ts">
import NotesList from "@/components/notes/NotesList.vue";
import { useAllNotes } from "@/lib/queries/notes/note-queries.ts";
import { useModalStore } from "@/stores/modal.ts";
import { computed, ref } from "vue";

import Button from "../../components/ui/button/Button.vue";

import Input from "../../components/ui/input/Input.vue";
import Icon from "@/components/icons/Icon.vue";

import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import MobilePageHeader from "@/Layouts/AuthLayout/components/MobilePageHeader.vue";
import ResponsivePopover from "@/components/forms/ResponsivePopover.vue";
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import Skeleton from "../../components/ui/skeleton/Skeleton.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser.ts";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

const { data: notes, isLoading } = useAllNotes();

const { usersOwnVehicles } = useCurrentUser();

const modalStore = useModalStore();

const filters = ref({
  searchQuery: "",
  vehicleId: "",
  types: [] as string[],
});

const TYPE_FILTERS = [
  { type: "pinned", label: "Pinned" },
  { type: "own", label: "Own vehicles" },
];
type VehicleFilterType = (typeof TYPE_FILTERS)[number]["type"];
const allTypesActive = computed(() => filters.value.types.length === 0);
const isTypeActive = (type: VehicleFilterType) => !allTypesActive.value && filters.value.types.includes(type);
const toggleType = (type: VehicleFilterType) => {
  const current = filters.value.types;
  filters.value = {
    ...filters.value,
    types: current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
  };
};

const hasFilters = computed(() => {
  return Object.values(filters.value).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value)));
});
const clearAllFilters = () => {
  filters.value = {
    ...filters.value,
    searchQuery: "",
    vehicleId: "",
    types: [],
  };
};

const filteredNotes = computed(() => {
  if (!notes.value) return [];

  return notes.value.filter((note) => {
    if (filters.value.vehicleId && note.vehicle.id !== filters.value.vehicleId) return false;

    if (filters.value.searchQuery) {
      const qr = filters.value.searchQuery.toLowerCase();
      if (!note.title?.toLowerCase().includes(qr) && !note.content?.toLowerCase().includes(qr)) return false;
    }

    // Type filters
    if (filters.value.types.length > 0) {
      const types = filters.value.types;
      if (types.includes("pinned") && !note.pinned) return false;
      if (types.includes("own") && !usersOwnVehicles.value.some((v) => v.vehicleData.id === note.vehicle.id))
        return false;
    }

    return true;
  });
});
</script>

<template>
  <MainContentWrapper class="flex flex-1 flex-col lg:pt-20">
    <template #mobile-header>
      <MobilePageHeader class="justify-between">
        <span class="text-lg font-medium"> Your Notes </span>

        <div class="flex gap-2">
          <ResponsivePopover title="Filters" description="Select custom filters for the timeline view.">
            <template #trigger>
              <Button variant="outline" size="icon" class="relative">
                <Icon name="filter" />
                <span
                  v-if="filters.vehicleId"
                  class="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-bold"
                >
                  1
                </span>
              </Button>
            </template>

            <template #content>
              <VehicleSelect
                placeholder="Select a vehicle"
                :value="filters.vehicleId"
                @value-change="(value) => (filters.vehicleId = value)"
              />
            </template>

            <template #footer="{ close }">
              <Button
                variant="outline"
                @click="
                  clearAllFilters;
                  close();
                "
              >
                Clear filters
              </Button>
            </template>
          </ResponsivePopover>

          <Button variant="secondary" size="icon" @click="modalStore.onOpen('createNote')">
            <Icon name="plus" class="stroke-current" />
          </Button>
        </div>
      </MobilePageHeader>
    </template>

    <header class="mb-4 hidden justify-between gap-4 md:flex">
      <h1>Your notes</h1>

      <Button variant="default" class="" @click="modalStore.onOpen('createNote')">
        <Icon name="plus" class="stroke-white" />
        Create Note
      </Button>
    </header>

    <!-- controls -->
    <div class="mb-4 flex w-full flex-col justify-between gap-4 md:flex-row">
      <!--      Type filters-->
      <div class="flex items-center gap-2">
        <Button
          size="sm"
          class="rounded-full"
          :variant="allTypesActive ? 'default' : 'outline'"
          @click="filters.types = []"
        >
          All
        </Button>

        <Button
          v-for="type in TYPE_FILTERS"
          :key="type.type"
          size="sm"
          class="rounded-full"
          :variant="isTypeActive(type.type) ? 'default' : 'outline'"
          @click="toggleType(type.type)"
        >
          {{ type.label }}
        </Button>
      </div>
      <div class="order-first flex items-center gap-2 md:order-last">
        <Input
          v-model="filters.searchQuery"
          type="text"
          icon="search"
          class="w-full max-w-96"
          placeholder="Search from notes..."
        />
        <ResponsivePopover title="Filters">
          <template #trigger>
            <Button variant="outline" class="relative hidden h-full! md:flex">
              <Icon name="filter" />
              <span class="hidden sm:inline">Filters</span>
              <span
                v-if="filters.vehicleId"
                class="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-bold"
              >
                1
              </span>
            </Button>
          </template>

          <template #content>
            <div class="gaps-sm flex flex-col md:w-sm">
              <div>
                <VehicleSelect
                  placeholder="Select a vehicle"
                  :value="filters.vehicleId"
                  @value-change="(value) => (filters.vehicleId = value)"
                />
              </div>
            </div>
          </template>

          <template #footer="{ close }">
            <Button
              variant="outline"
              @click="
                clearAllFilters;
                close();
              "
            >
              Clear filters
            </Button>
          </template>
        </ResponsivePopover>
      </div>
    </div>

    <div class="w-full">
      <!-- ── Loading skeletons ────────────────────────────────────── -->
      <div v-if="isLoading" class="flex flex-col">
        <div v-for="i in 5" :key="i" class="mb-6 flex gap-3">
          <div class="flex w-8 shrink-0 flex-col items-center gap-2">
            <Skeleton class="size-8 rounded-full" />
            <Skeleton class="h-16 w-0.5 rounded-full" />
          </div>
          <div class="flex-1 space-y-2 pt-1">
            <Skeleton class="h-3 w-24 rounded" />
            <Skeleton class="h-14 w-full rounded-lg" />
          </div>
        </div>
      </div>

      <!-- ── Empty state ──────────────────────────────────────────── -->
      <Empty v-else-if="filteredNotes.length === 0" class="mt-20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon name="notes" class="text-muted-foreground" size="lg" />
          </EmptyMedia>
          <EmptyTitle>No notes found</EmptyTitle>
          <EmptyDescription>
            {{ hasFilters ? "Try adjusting your filters or search query." : "Get started by creating a new note!" }}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button v-if="hasFilters" variant="outline" size="sm" class="mt-5" @click="clearAllFilters">
            Clear filters
          </Button>
        </EmptyContent>
      </Empty>

      <!--      Notes list -->
      <NotesList v-if="filteredNotes && filteredNotes.length > 0" :notes="filteredNotes" />
    </div>
  </MainContentWrapper>
</template>
