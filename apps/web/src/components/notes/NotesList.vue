<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Empty from "@/components/ui/empty/Empty.vue";
import EmptyHeader from "@/components/ui/empty/EmptyHeader.vue";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import EmptyContent from "@/components/ui/empty/EmptyContent.vue";
import Button from "@/components/ui/button/Button.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Input from "@/components/ui/input/Input.vue";
import type { Note } from "@repo/validation";
import { computed, ref } from "vue";
import { getTextSnippet } from "@/lib/utils/noteUtils";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import NoteListMobileItem from "@/components/notes/noteListMobileItem.vue";

const props = defineProps<{
  notes: Note[] | undefined;
  isLoading: boolean;
  selectedNoteId?: string | null;
}>();

const searchQuery = ref("");
const filteredNotes = computed(() => {
  if (!searchQuery.value) return props.notes;
  return props.notes?.filter(
    (note) =>
      (note.title && note.title.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (note.content && String(note.content).toLowerCase().includes(searchQuery.value.toLowerCase())),
  );
});
const emit = defineEmits<{
  (e: "selectNote", note: Note): void;
  (e: "createNewNote"): void;
}>();

const selectNote = (note: Note) => {
  emit("selectNote", note);
};
const handleNewClick = () => {
  emit("createNewNote");
};

const isMobile = useIsMobile();
</script>
<template>
  <div class="flex flex-1 flex-col gap-4 lg:max-w-96 lg:border-r">
    <!-- controls -->
    <div class="flex flex-col gap-4 lg:pr-8">
      <Input
        v-model="searchQuery"
        type="text"
        name="search"
        id="VehicleNoteSearch"
        placeholder="Search notes..."
        class="w-full"
      />
      <div class="flex content-center justify-evenly gap-4">
        <DropdownMenu :modal="false">
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="flex-1">
              <Icon name="filter" /> <span class="md:hidden">Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-52"> </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="default" class="flex-1 sm:w-auto" @click="handleNewClick">
          <Icon name="plus" class="stroke-white" />
          Create Note
        </Button>
      </div>
    </div>

    <div class="scrollbar-thin flex overflow-y-auto lg:pr-8" v-if="!props.isLoading">
      <ul v-if="filteredNotes && filteredNotes.length" class="flex w-full flex-col gap-4 lg:gap-2">
        <template v-if="!isMobile">
          <li
            v-for="note in filteredNotes"
            :key="note.id"
            :class="[
              'hover:bg-accent listHover group block cursor-pointer rounded bg-transparent px-3 py-3',
              props.selectedNoteId === note.id && 'bg-accent!',
            ]"
            @click="selectNote(note)"
          >
            <div class="flex w-full items-center justify-between">
              <span class="min-w-0 font-medium break-all">{{ note.title }}</span>

              <Icon name="pin" v-if="note.pinned" class="stroke-primary size-4" />
            </div>
            <div class="text-muted-foreground line-clamp-6 min-w-0 text-sm break-all lg:line-clamp-3">
              {{ getTextSnippet(String(note.content), 80) }}
            </div>
          </li>
        </template>

        <template v-else>
          <NoteListMobileItem v-for="note in filteredNotes" :key="note.id" :note="note" @note-click="selectNote" />
        </template>
      </ul>
      <Empty v-else-if="!notes?.length">
        <EmptyHeader>
          <EmptyTitle class="text-foreground"> You have no notes yet</EmptyTitle>
          <EmptyDescription> Get started by creating a new note! </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button @click="handleNewClick"> Create Note </Button>
        </EmptyContent>
      </Empty>
    </div>
  </div>
</template>
