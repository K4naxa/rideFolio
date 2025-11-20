<script setup lang="ts">
import { useModalStore } from "@/stores/modal";
import { computed } from "vue";
import { ref, watch } from "vue";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type AlertModalData = {
  title?: string;
  description?: string;
  actionButton?: {
    label?: string;
    class?: string;
  };
  cancelButton?: {
    label?: string;
  };
  onAction?: () => void | Promise<void>;
  onCancel?: () => void;
};

const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.type === "alert" && modalStore.isOpen);
const modalData = computed(() => modalStore.data as AlertModalData);

const localData = ref<AlertModalData | null>(null);

// When the modal opens, snapshot the store data
watch(
  () => isModalOpen.value,
  (open) => {
    if (open) {
      localData.value = modalData.value ?? null;
    }
  },
  { immediate: true },
);

const title = computed(() => localData.value?.title || "Are you sure?");
const description = computed(() => localData.value?.description || "This action cannot be undone.");
const actionLabel = computed(() => localData.value?.actionButton?.label || "Continue");
const actionClass = computed(() => localData.value?.actionButton?.class);
const cancelLabel = computed(() => localData.value?.cancelButton?.label || "Cancel");

async function handleAction() {
  if (localData.value?.onAction) {
    await localData.value.onAction();
  }
  modalStore.onClose();
}
function handleCancel() {
  if (localData.value?.onCancel) {
    localData.value.onCancel();
  }
  modalStore.onClose();
}
</script>

<template>
  <AlertDialog :open="isModalOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>
          <span class="text-muted-foreground" v-html="description" />
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="handleCancel" data-cy="cancel">
          {{ cancelLabel }}
        </AlertDialogCancel>
        <AlertDialogAction @click="handleAction" :class="actionClass" data-cy="action">
          {{ actionLabel }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
