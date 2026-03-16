<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";

import { getTextSnippet } from "@/lib/utils/noteUtils";
import type { Note } from "@repo/validation";

const props = defineProps<{
  note: Note;
}>();

const emit = defineEmits<{
  (e: "note-click", note: Note): void;
}>();

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const selectNote = (note: Note) => {
  emit("note-click", note);
};
</script>
>

<template>
  <button
    @click="selectNote(props.note)"
    @keydown.enter="selectNote(props.note)"
    @keydown.space.prevent="selectNote(props.note)"
    class="card group cardHover flex cursor-pointer flex-col gap-2 p-5 transition-colors"
  >
    <!--      Header-->
    <span class="relative flex justify-between gap-4 font-medium">
      {{ props.note.title }}

      <Icon v-if="props.note.pinned" name="pin" class="text-primary absolute top-0 right-0 size-4" />
    </span>

    <!--      Content-->
    <span
      v-if="props.note.content"
      class="text-muted-foreground line-clamp-5 overflow-hidden text-start text-sm break-all"
    >
      {{ getTextSnippet(String(note.content), 500) }}
    </span>

    <!--      footer-->
    <span class="text-muted-foreground mt-auto ml-auto text-xs">Last edited: {{ formatDate(note.updatedAt) }}</span>
  </button>
</template>
