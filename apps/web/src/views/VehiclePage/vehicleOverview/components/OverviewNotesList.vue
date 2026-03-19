<script lang="ts" setup>
import Icon from "@/components/icons/Icon.vue";
import NoteItem from "@/components/notes/NoteItem.vue";
import Button from "@/components/ui/button/Button.vue";
import Empty from "@/components/ui/empty/Empty.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import FetchError from "@/components/ui/FetchError.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useVehicleNotes } from "@/lib/queries/notes/note-queries";
import { useModalStore } from "@/stores/modal";
import type { Note } from "@repo/validation";
import { RouterLink } from "vue-router";
import { EmptyHeader, EmptyTitle } from "@/components/ui/empty";

const { currentVehicleId } = useCurrentVehicle();

const {
  data: notes,
  isLoading: isNotesLoading,
  isError: isNotesError,
  isFetching,
  refetch,
} = useVehicleNotes(currentVehicleId);
function handleNoteClick(note: Note) {
  modalStore.onOpen("createNote", note.id);
}

const modalStore = useModalStore();
</script>

<template>
  <div class="w-full">
    <h2 class="mb-2 flex items-end justify-between">
      Notes
      <Button variant="outline" size="icon-sm" @click="modalStore.onOpen('createNote')"><Icon name="plus" /></Button>
    </h2>
    <Separator class="mb-4" />

    <div class="scrollbar-macos w-full min-w-0 overflow-x-auto md:overflow-hidden">
      <div v-if="isNotesLoading" class="grid flex-1 place-items-center">
        <Spinner class="text-muted-foreground size-10" />
      </div>
      <FetchError v-else-if="isNotesError" title="Failed to load notes" :refetch :isFetching />
      <Empty v-else-if="!notes || notes.length === 0" class="card">
        <EmptyHeader>
          <EmptyTitle> No notes yet </EmptyTitle>
          <EmptyDescription> Jot down something about your vehicles. </EmptyDescription>
        </EmptyHeader>
      </Empty>
      <ul class="gaps-md grid w-full md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <NoteItem v-for="note in notes?.slice(0, 4)" :key="note.id" :note="note" @note-click="handleNoteClick" />

        <Button v-if="notes && notes.length > 4" variant="link" size="sm" asChild class="mr-auto">
          <RouterLink :to="`/vehicles/${currentVehicleId}/notes`" class="flex items-center gap-1">
            View all vehicle notes
            <Icon name="arrowRight" class="size-4" />
          </RouterLink>
        </Button>
      </ul>
    </div>
  </div>
</template>
