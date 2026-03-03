<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Empty from "@/components/ui/empty/Empty.vue";
import EmptyHeader from "@/components/ui/empty/EmptyHeader.vue";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import EmptyContent from "@/components/ui/empty/EmptyContent.vue";
import Button from "@/components/ui/button/Button.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Input from "@/components/ui/input/Input.vue";
import type { Note } from "@repo/validation";
import { computed, ref } from "vue";
import NoteListMobileItem from "@/components/notes/noteListMobileItem.vue";
import { useModalStore } from "@/stores/modal.ts";
import { useAllNotes } from "@/lib/queries/notes/note-queries.ts";

const { data: notes, isLoading } = useAllNotes();

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

const selectNote = (note: Note) => {
  modalStore.onOpen("createNote", note.id);
};
const handleNewClick = () => {
  modalStore.onOpen("createNote");
};
</script>
<template>
  <div class="flex flex-1 flex-col gap-4">
    <!-- controls -->
    <div class="flex flex-col gap-4 lg:pr-8">
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

        <Button variant="default" class="flex-1 sm:w-auto" @click="handleNewClick">
          <Icon name="plus" class="stroke-white" />
          Create Note
        </Button>
      </div>
    </div>

    <div class="scrollbar-thin flex overflow-y-auto lg:pr-8" v-if="!isLoading">
      <ul
        v-if="filteredNotes && filteredNotes.length"
        class="gaps-md grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      >
        <NoteListMobileItem v-for="note in filteredNotes" :key="note.id" :note="note" @note-click="selectNote" />
      </ul>
      <Empty v-else-if="!notes?.length">
        <EmptyHeader>
          <EmptyTitle class="text-foreground"> You have no notes yet</EmptyTitle>
          <EmptyDescription> Get started by creating a new note! </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button @click="handleNewClick"> Create Note </Button>
        </EmptyContent>
      </Empty>
    </div>
  </div>
</template>
