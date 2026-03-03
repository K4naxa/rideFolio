<script setup lang="ts">
import NotesList from "@/components/notes/NotesList.vue";
import { useAllNotes, useVehicleNotes } from "@/lib/queries/notes/note-queries.ts";
import EmptyHeader from "../../../components/ui/empty/EmptyHeader.vue";
import Button from "../../../components/ui/button/Button.vue";
import EmptyTitle from "../../../components/ui/empty/EmptyTitle.vue";
import EmptyDescription from "../../../components/ui/empty/EmptyDescription.vue";
import EmptyContent from "../../../components/ui/empty/EmptyContent.vue";
import Empty from "../../../components/ui/empty/Empty.vue";
import DropdownMenuContent from "../../../components/ui/dropdown-menu/DropdownMenuContent.vue";
import Input from "../../../components/ui/input/Input.vue";
import Icon from "@/components/icons/Icon.vue";
import DropdownMenu from "../../../components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuTrigger from "../../../components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import { useModalStore } from "@/stores/modal.ts";
import { computed, ref } from "vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle.ts";

const { currentVehicleId } = useCurrentVehicle();
const { data: notes, isLoading } = useVehicleNotes(currentVehicleId);

const modalStore = useModalStore();

const searchQuery = ref("");
const filteredNotes = computed(() => {
  if (!notes.value) return [];
  if (!searchQuery.value) return notes.value;

  return notes.value.filter(
    (note) =>
      (note.title && note.title.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (note.content && String(note.content).toLowerCase().includes(searchQuery.value.toLowerCase())),
  );
});
</script>

<template>
  <div class="flex flex-1 flex-col gap-12">
    <!-- controls -->
    <div class="flex w-full flex-col gap-4 lg:pr-8">
      <Input
        v-model="searchQuery"
        type="text"
        name="search"
        id="VehicleNoteSearch"
        placeholder="Search notes..."
        class="w-full"
      />
      <div class="flex content-center justify-evenly gap-4">
        <DropdownMenu :modal="false">
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="flex-1">
              <Icon name="filter" /> <span class="md:hidden">Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-52"> </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="default" class="flex-1 sm:w-auto" @click="modalStore.onOpen('createNote')">
          <Icon name="plus" class="stroke-white" />
          Create Note
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
