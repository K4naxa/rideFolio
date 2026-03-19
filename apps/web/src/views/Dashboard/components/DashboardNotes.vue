<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import NoteItem from "@/components/notes/NoteItem.vue";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import FetchError from "@/components/ui/FetchError.vue";
import { useAllNotes } from "@/lib/queries/notes/note-queries";
import { useModalStore } from "@/stores/modal";
import type { Note } from "@repo/validation";
import DashboardSection from "./DashboardSection.vue";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

const modalStore = useModalStore();
const { data: notes, isLoading, isError, isFetching, refetch } = useAllNotes();

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
    <FetchError v-else-if="isError" title="Failed to load notes" :refetch :isFetching />
    <Empty v-else-if="!notes || notes.length === 0" class="card">
      <EmptyHeader>
        <EmptyTitle> No notes yet </EmptyTitle>
        <EmptyDescription> Jot down something about your vehicles. </EmptyDescription>
      </EmptyHeader>
    </Empty>
    <ul v-else class="gaps-md grid grid-cols-1 md:grid-cols-2">
      <NoteItem v-for="note in notes.slice(0, MAX_ITEMS)" :key="note.id" :note="note" @note-click="handleNoteClick" />
    </ul>
  </DashboardSection>
</template>
