<script setup lang="ts">
import { computed, ref } from "vue";

import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Icon from "@/components/icons/Icon.vue";
import { CheckIcon, SaveIcon } from "lucide-vue-next";
import NoteSection from "@/views/VehiclePage/VehicleNotes/components/NoteSection.vue";

import { useModalStore } from "@/stores/modal";
import { useNoteByIdQuery } from "@/lib/queries/notes/note-queries";

const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createNote");

const { data: editableNote } = useNoteByIdQuery(
  computed(() => (modalStore.type === "createNote" && modalStore.itemId ? modalStore.itemId : undefined)),
);

const noteSectionRef = ref<InstanceType<typeof NoteSection> | null>(null);

const handleClose = () => {
  modalStore.onClose();
};
</script>

<template>
  <ResponsiveFormDialog
    :open="isModalOpen"
    @close="handleClose"
    :title="editableNote ? 'Edit Note' : 'New Note'"
    icon="notes"
    content-class="max-w-4xl lg:min-h-96"
  >
    <template #headerActions>
      <div class="grid aspect-square w-8 place-items-center rounded-sm border">
        <Spinner v-if="noteSectionRef?.saveStatus === 'saving'" class="size-4" />
        <SaveIcon v-else-if="noteSectionRef?.saveStatus === 'pending'" class="stroke-warning size-4" />
        <CheckIcon v-else class="stroke-success size-4" />
      </div>

      <template v-if="!noteSectionRef?.isNew">
        <Button
          variant="ghost"
          size="icon"
          :disabled="noteSectionRef?.isDeleting"
          class="stroke-muted-foreground hover:bg-destructive/20 hover:stroke-destructive"
          @click="noteSectionRef?.handleDelete()"
        >
          <Icon name="trash" class="size-4 stroke-inherit" />
        </Button>

        <Button variant="ghost" size="icon" @click="noteSectionRef?.handleTogglePin()">
          <Icon name="pin" :class="['size-4', noteSectionRef?.isPinned && 'stroke-primary']" />
        </Button>
      </template>
    </template>

    <NoteSection ref="noteSectionRef" :note="editableNote" @close="handleClose" @deleted="handleClose" />
  </ResponsiveFormDialog>
</template>
