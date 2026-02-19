<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMediaQuery } from "@vueuse/core";
import { useModalStore } from "@/stores/modal";
import { type Note } from "@repo/validation";

import { useAllNotes, useNoteByIdQuery } from "@/lib/queries/notes/note-queries";
import NoteSection from "@/views/VehiclePage/VehicleNotes/components/NoteSection.vue";
import NotesList from "@/components/notes/NotesList.vue";

const searchQuery = ref("");

const router = useRouter();
const route = useRoute();
const { onOpen } = useModalStore();
const isMobile = useMediaQuery("(max-width: 1024px)");

const { data: notes, isLoading } = useAllNotes();

const selectedNoteId = ref<string | null>(null);

const { data: editableNote } = useNoteByIdQuery(
  computed(() => (selectedNoteId.value ? selectedNoteId.value : undefined)),
);

const handleSelectNote = (note: Note) => {
  selectedNoteId.value = note.id;
  if (isMobile.value) onOpen("createNote", note.id);
};

const handleNewClick = () => {
  selectedNoteId.value = null;
  if (isMobile.value) onOpen("createNote");
};
</script>

<template>
  <div class="flex flex-1 gap-8 p-4 lg:max-h-[calc(100vh-var(--app-header-height))] lg:p-8">
    <!-- left side -->

    <NotesList
      :notes="notes"
      :is-loading="isLoading"
      :selected-note-id="selectedNoteId"
      @select-note="handleSelectNote"
      @create-new-note="handleNewClick"
    />

    <div class="hidden flex-1 flex-col lg:flex">
      <NoteSection :note="editableNote" />
    </div>
  </div>
</template>
