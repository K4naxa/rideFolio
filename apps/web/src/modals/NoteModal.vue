<script setup lang="ts">
import { computed } from "vue";

// Components
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import { DialogScrollContent } from "@/components/ui/dialog";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Icon from "@/components/icons/Icon.vue";
import { CheckIcon, SaveIcon } from "lucide-vue-next";
import NoteSection from "@/views/VehiclePage/VehicleNotes/components/NoteSection.vue";

import { useModalStore } from "@/stores/modal";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";

import type { Note } from "@repo/validation";

const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createNote");
const initialNote = computed(() => modalStore.data as Note | null);

const { currentVehicleId } = useCurrentVehicle();

const vehicleId = computed(() => {
  return initialNote.value?.vehicle.id ?? currentVehicleId.value ?? "";
});

const handleClose = () => {
  modalStore.onClose();
};
</script>

<template>
  <Dialog :open="isModalOpen" @update:open="handleClose">
    <DialogScrollContent class="h-full max-w-4xl lg:h-fit lg:max-h-[90vh] lg:min-h-96">
      <NoteSection
        v-if="isModalOpen"
        :noteId="initialNote?.id ?? 'new'"
        :vehicleId="vehicleId"
        @close="handleClose"
        @deleted="handleClose"
      >
        <template #header="{ isNew, isPinned, isDeleting, saveStatus, onDelete, onTogglePin, onClose }">
          <DialogHeader>
            <DialogTitle class="flex items-center">
              <Icon name="notes" /> {{ isNew ? "New Note" : "Edit Note" }}

              <div class="ml-auto flex items-center gap-2">
                <!-- Status indicator -->
                <div class="grid aspect-square w-8 place-items-center rounded-sm border">
                  <Spinner v-if="saveStatus === 'saving'" class="size-4" />
                  <SaveIcon v-else-if="saveStatus === 'pending'" class="stroke-warning size-4" />
                  <CheckIcon v-else class="stroke-success size-4" />
                </div>

                <!-- Actions for existing notes -->
                <template v-if="!isNew">
                  <Button
                    variant="ghost"
                    size="icon"
                    :disabled="isDeleting"
                    class="stroke-muted-foreground hover:bg-destructive/20 hover:stroke-destructive"
                    @click="onDelete"
                  >
                    <Icon name="trash" class="size-4 stroke-inherit" />
                  </Button>

                  <Button variant="ghost" size="icon" @click="onTogglePin">
                    <Icon :name="isPinned ? 'pin' : 'pin'" :class="['size-4', isPinned && 'stroke-primary']" />
                  </Button>
                </template>
              </div>
            </DialogTitle>
            <DialogDescription class="sr-only">
              {{ isNew ? "Create a new note" : "Edit your note" }}
            </DialogDescription>
          </DialogHeader>
        </template>
      </NoteSection>
    </DialogScrollContent>
  </Dialog>
</template>
