<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMediaQuery } from "@vueuse/core";
import { useModalStore } from "@/stores/modal";
import { type Note } from "@repo/validation";

import { useAllNotes } from "@/lib/queries/notes/note-queries";
import NoteSection from "@/views/VehiclePage/VehicleNotes/components/NoteSection.vue";
import NotesList from "@/components/notes/NotesList.vue";

const searchQuery = ref("");

const router = useRouter();
const route = useRoute();
const { onOpen } = useModalStore();
const isMobile = useMediaQuery("(max-width: 1024px)");

const { data: notes, isLoading } = useAllNotes();

const selectedNoteId = computed({
  get: () => route.query.note as string | null,
  set: (noteId: Note["id"] | null) => {
    router.push({
      query: { ...route.query, note: noteId || undefined },
    });
  },
});

const selectNote = (note: Note) => {
  if (!isMobile.value) selectedNoteId.value = note.id;
  else {
    console.log("Opening modal for mobile view");
    onOpen("createNote", note);
  }
};

const handleNewClick = () => {
  if (!isMobile.value) selectedNoteId.value = "new";
  else {
    onOpen("createNote", null);
  }
};
</script>

<template>
  <div class="flex flex-1 gap-8 p-4 lg:max-h-[calc(100vh-var(--app-header-height))] lg:p-8">
    <!-- left side -->

    <NotesList
      :notes="notes"
      :is-loading="isLoading"
      :selected-note-id="selectedNoteId"
      @select-note="selectNote"
      @create-new-note="handleNewClick"
    />

    <div class="hidden flex-1 flex-col lg:flex">
      <NoteSection v-if="selectedNoteId" :note-id="selectedNoteId" vehicle-id="" class="" />
      <div v-else class="text-muted-foreground flex flex-1 items-center justify-center">
        Select a note to view or edit

        {{ selectedNoteId }}
      </div>
    </div>
  </div>
</template>
