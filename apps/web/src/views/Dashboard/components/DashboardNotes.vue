<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import NoteItem from "@/components/notes/NoteItem.vue";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useAllNotes } from "@/lib/queries/notes/note-queries";
import { useModalStore } from "@/stores/modal";
import type { Note } from "@repo/validation";
import DashboardSection from "./DashboardSection.vue";

const modalStore = useModalStore();
const { data: notes, isLoading, isError } = useAllNotes();

function handleNoteClick(note: Note) {
  modalStore.onOpen("createNote", note.id);
}

const MAX_ITEMS = 4;
</script>

<template>
  <DashboardSection title="Notes" icon="notes" show-more-to="/notes">
    <template #action>
      <Button variant="ghost" size="icon-sm" @click="modalStore.onOpen('createNote')">
        <Icon name="plus" />
      </Button>
    </template>

    <div v-if="isLoading" class="grid h-32 place-items-center">
      <Spinner class="text-muted-foreground size-8" />
    </div>
    <div v-else-if="isError" class="grid h-32 place-items-center">
      <span class="text-destructive text-sm">Failed to load notes.</span>
    </div>
    <div v-else-if="!notes || notes.length === 0" class="grid h-32 place-items-center text-center">
      <div class="space-y-1">
        <p class="text-muted-foreground text-sm">No notes yet</p>
        <p class="text-muted-foreground/70 text-xs">Jot down something about your vehicles.</p>
      </div>
    </div>
    <ul v-else class="gaps-md grid grid-cols-1 md:grid-cols-2">
      <NoteItem v-for="note in notes.slice(0, MAX_ITEMS)" :key="note.id" :note="note" @note-click="handleNoteClick" />
    </ul>
  </DashboardSection>
</template>
