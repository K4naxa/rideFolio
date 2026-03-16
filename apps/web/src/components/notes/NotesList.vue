<script setup lang="ts">
import type { Note } from "@repo/validation";
import { computed, ref } from "vue";
import { useModalStore } from "@/stores/modal.ts";
import NoteItem from "@/components/notes/NoteItem.vue";

const props = defineProps<{ notes: Note[] }>();

const modalStore = useModalStore();

const searchQuery = ref("");
const filteredNotes = computed(() => {
  if (!searchQuery.value) return props.notes;

  return props.notes.filter(
    (note) =>
      (note.title && note.title.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (note.content && String(note.content).toLowerCase().includes(searchQuery.value.toLowerCase())),
  );
});

const selectNote = (note: Note) => {
  modalStore.onOpen("createNote", note.id);
};
</script>
<template>
  <ul class="gaps-sm grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
    <li
      v-for="note in filteredNotes"
      :key="note.id"
      tabindex="0"
      @click="selectNote(note)"
      @keydown.enter="selectNote(note)"
      @keydown.space.prevent="selectNote(note)"
    >
      <NoteItem :note="note" />
    </li>
  </ul>
</template>
