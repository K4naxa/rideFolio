<script setup lang="ts">
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import NoteSection from "./components/NoteSection.vue";
import { useModalStore } from "@/stores/modal";
import { type Note } from "@repo/validation";
import { useNoteByIdQuery, useVehicleNotes } from "@/lib/queries/notes/note-queries";
import NotesList from "@/components/notes/NotesList.vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";

const router = useRouter();
const route = useRoute();
const { onOpen } = useModalStore();
const isMobile = useIsMobile();

const { currentVehicleId } = useCurrentVehicle();
const { data: vehicleNotes, isLoading: vehicleNotesLoading } = useVehicleNotes(currentVehicleId);

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
      <NoteSection :note="editableNote" />
    </div>
  </div>
</template>
