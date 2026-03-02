<script setup lang="ts">
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import NoteSection from "./components/NoteSection.vue";
import { useModalStore } from "@/stores/modal";
import { type Note } from "@repo/validation";
import { useVehicleNotes } from "@/lib/queries/notes/note-queries";
import NotesList from "@/components/notes/NotesList.vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";

const { onOpen } = useModalStore();
const isMobile = useIsMobile();

const { currentVehicleId } = useCurrentVehicle();
const { data: vehicleNotes, isLoading: vehicleNotesLoading } = useVehicleNotes(currentVehicleId);

const selectedNoteId = ref<string | null>(null);

const editableNote = ref<Note | undefined>();
const handleSelectNote = (note: Note) => {
  selectedNoteId.value = note.id;
  editableNote.value = note;
  if (isMobile.value) onOpen("createNote", note.id);
};

const handleNewClick = () => {
  selectedNoteId.value = null;
  editableNote.value = undefined;
  if (isMobile.value) onOpen("createNote");
};

const handleNoteCreated = (note: Note) => {
  selectedNoteId.value = note.id;
  editableNote.value = note;
};
</script>

<template>
  <div class="flex flex-1 gap-8 lg:max-h-[calc(100vh-var(--app-header-height)-var(--vehicle-navbar-height)-4rem)]">
    <!-- left side -->
    <NotesList
      :notes="vehicleNotes"
      :is-loading="vehicleNotesLoading"
      :selected-note-id="selectedNoteId"
      @select-note="handleSelectNote"
      @create-new-note="handleNewClick"
    />

    <div class="hidden min-w-0 flex-1 flex-col lg:flex">
      <NoteSection :note="editableNote" @created="handleNoteCreated" />
    </div>
  </div>
</template>
