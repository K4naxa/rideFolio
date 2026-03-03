<script setup lang="ts">
import NotesList from "@/components/notes/NotesList.vue";
import { useVehicleNotes } from "@/lib/queries/notes/note-queries.ts";
import EmptyHeader from "../../../components/ui/empty/EmptyHeader.vue";
import Button from "../../../components/ui/button/Button.vue";
import EmptyTitle from "../../../components/ui/empty/EmptyTitle.vue";
import EmptyDescription from "../../../components/ui/empty/EmptyDescription.vue";
import EmptyContent from "../../../components/ui/empty/EmptyContent.vue";
import Empty from "../../../components/ui/empty/Empty.vue";
import Input from "../../../components/ui/input/Input.vue";
import Icon from "@/components/icons/Icon.vue";
import { useModalStore } from "@/stores/modal.ts";
import { computed, ref } from "vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle.ts";

const { currentVehicleId } = useCurrentVehicle();
const { data: notes, isLoading } = useVehicleNotes(currentVehicleId);

const modalStore = useModalStore();

const filters = ref({
  searchQuery: "",
  types: [] as string[],
});

const TYPE_FILTERS = [{ type: "pinned", label: "Pinned" }];
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

const filteredNotes = computed(() => {
  if (!notes.value) return [];

  return notes.value.filter((note) => {
    if (filters.value.searchQuery) {
      const qr = filters.value.searchQuery.toLowerCase();
      if (!note.title?.toLowerCase().includes(qr) && !note.content?.toLowerCase().includes(qr)) return false;
    }

    // Type filters
    if (filters.value.types.length > 0) {
      const types = filters.value.types;
      if (types.includes("pinned") && !note.pinned) return false;
    }

    return true;
  });
});
</script>

<template>
  <div class="flex flex-1 flex-col">
    <!-- controls -->
    <div class="mb-6 flex w-full flex-col gap-4">
      <div class="flex w-full items-center justify-between gap-4">
        <Input
          v-model="filters.searchQuery"
          type="text"
          icon="search"
          placeholder="Search notes..."
          class="w-full max-w-96"
        />
        <div class="flex content-center justify-evenly gap-4">
          <Button variant="default" class="flex-1 sm:w-auto" @click="modalStore.onOpen('createNote')">
            <Icon name="plus" class="stroke-white" />
            <span class="hidden md:block">Create Note</span>
          </Button>
        </div>
      </div>
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
    </div>

    <template v-if="isLoading"> loading... </template>

    <template v-else>
      <Empty v-if="!notes?.length">
        <EmptyHeader>
          <EmptyTitle class="text-foreground"> You have no notes yet</EmptyTitle>
          <EmptyDescription> Get started by creating a new note! </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button @click="modalStore.onOpen('createNote')"> Create Note </Button>
        </EmptyContent>
      </Empty>

      <NotesList v-if="filteredNotes && filteredNotes.length > 0" :notes="filteredNotes" />

      <Empty v-else-if="!notes?.length">
        <EmptyHeader>
          <EmptyTitle class="text-foreground"> You have no notes yet</EmptyTitle>
          <EmptyDescription> Get started by creating a new note! </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button @click="modalStore.onOpen('createNote')"> Create Note </Button>
        </EmptyContent>
      </Empty>
    </template>
  </div>
</template>
