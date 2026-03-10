<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";

import type { Note } from "@repo/validation";
import { computed, ref } from "vue";
import { useModalStore } from "@/stores/modal.ts";
import { getTextSnippet } from "@/lib/utils/noteUtils.ts";

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

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>
<template>
  <ul class="gaps-sm grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
    <li
      v-for="note in filteredNotes"
      :key="note.id"
      class="card group cardHover flex cursor-pointer flex-col gap-2 p-5 transition-colors"
      @click="selectNote(note)"
    >
      <!--      Header-->
      <span class="relative flex justify-between gap-4 font-medium">
        {{ note.title }}

        <Icon v-if="note.pinned" name="pin" class="text-primary absolute top-0 right-0 size-4" />
      </span>

      <!--      Content-->
      <div class="flex w-full flex-col">
        <span v-if="note.content" class="text-muted-foreground mt-1 line-clamp-5 overflow-hidden text-sm break-all">
          {{ getTextSnippet(String(note.content), 500) }}
        </span>
      </div>

      <!--      footer-->
      <div class="mt-auto flex flex-col items-start gap-2">
        <span class="text-muted-foreground ml-auto text-xs">Last edited: {{ formatDate(note.updatedAt) }}</span>
      </div>
    </li>
  </ul>
</template>
