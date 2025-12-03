<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ErrorMessage, Field, useForm } from "vee-validate";

// Components
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Button from "@/components/ui/button/Button.vue";
import Badge from "@/components/ui/badge/Badge.vue";

import { useModalStore } from "@/stores/modal";

// Types
import type { Note, NoteSchemaType } from "@repo/validation";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import Input from "@/components/ui/input/Input.vue";
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import { watchDebounced } from "@vueuse/core";
import TipTapEditor from "@/components/textEditor/TipTapEditor.vue";
import { useCreateNote, useDeleteNote, useUpdateNote } from "@/lib/queries/notes/note-mutations";
import Icon from "@/components/icons/Icon.vue";
import { useSelectedVehicle } from "@/lib/composables/useSelectedVehicle";

// Computed properties
const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createNote");
const initialNote = computed(() => modalStore.data as Note | null);

const { values, errors, setFieldValue, resetForm, meta } = useForm<NoteSchemaType>({
  initialValues: {
    vehicleId: initialNote.value?.vehicle.id || "",
    title: initialNote.value?.title || "",
    content: initialNote.value?.content || "",
    pinned: initialNote.value?.pinned || false,
    tags: initialNote.value?.tags || [],
  },
});

const { selectedVehicle } = useSelectedVehicle(values.vehicleId);
const { currentVehicleId } = useCurrentVehicle();

const { mutateAsync: createNoteAsync } = useCreateNote();
const { mutateAsync: updateNoteAsync } = useUpdateNote();
const { mutate: deleteNote } = useDeleteNote();

// State
const createdNoteId = ref<string | null>(null);
const isSubmitting = ref(false);
const tagInput = ref("");

watchDebounced(
  () => [values.title, values.content, values.tags],
  async () => {
    // Only auto-save if we have required fields filled
    if (!meta.value.dirty) {
      return;
    }

    try {
      isSubmitting.value = true;

      if (!createdNoteId.value) {
        // Create new note
        const response = await createNoteAsync(values);
        createdNoteId.value = response.id;
      } else {
        // Update existing note
        await updateNoteAsync({
          noteId: createdNoteId.value,
          data: values,
        });
      }
    } catch (error) {
      console.error("Failed to auto-save note:", error);
    } finally {
      isSubmitting.value = false;
    }
  },
  {
    debounce: 2500,
    deep: true,
  },
);

const handleCancel = async () => {
  if (createdNoteId.value) {
    deleteNote({ noteId: createdNoteId.value, vehicleId: values.vehicleId });
  }
  handleClose();
};

// Handlers
const handleClose = async () => {
  modalStore.onClose();
  setTimeout(() => {
    resetForm();
    tagInput.value = "";
    createdNoteId.value = null;
  }, 250);
};

const handleAddTag = () => {
  const trimmedTag = tagInput.value.trim();
  if (trimmedTag !== "" && !values?.tags?.includes(trimmedTag)) {
    setFieldValue("tags", [...(values.tags || []), trimmedTag]);
    tagInput.value = "";
  }
};

const handleRemoveTag = (tagToRemove: string) => {
  setFieldValue(
    "tags",
    values.tags?.filter((tag) => tag !== tagToRemove),
  );
};

// Setup form when opening modal
watch(isModalOpen, (isOpen) => {
  if (!isOpen) return;

  // If editing existing note, populate form with note data
  if (initialNote.value) {
    resetForm({
      values: {
        vehicleId: initialNote.value.vehicle.id,
        title: initialNote.value.title,
        content: initialNote.value.content,
        tags: initialNote.value.tags || [],
        pinned: initialNote.value.pinned || false,
      },
    });
    createdNoteId.value = initialNote.value.id;
  } else if (currentVehicleId.value) {
    // Creating new note with active vehicle
    resetForm({
      values: {
        vehicleId: currentVehicleId.value,
        title: "",
        content: "",
        tags: [],
        pinned: false,
      },
    });
  } else {
    // No active vehicle, reset to empty
    resetForm({
      values: {
        vehicleId: "",
        title: "",
        content: "",
        tags: [],
        pinned: false,
      },
    });
  }
});
</script>

<template>
  <Dialog v-model:open="isModalOpen" @update:open="handleClose" :key="initialNote?.id">
    <DialogContent class="flex max-w-4xl flex-col lg:h-fit lg:max-h-[90vh]">
      <DialogHeader class="flex w-full flex-row justify-between gap-2">
        <DialogTitle class="flex items-center justify-start gap-2 truncate">
          <span v-if="initialNote">{{ values.title }}</span>
          <span v-else>Create Note</span>
        </DialogTitle>
        <Button v-if="!initialNote" variant="outline" @click="handleCancel">Cancel</Button>
      </DialogHeader>

      <form class="flex min-h-0 flex-col space-y-4" @submit.prevent>
        <!-- Vehicle Selection - Only show when creating new note without vehicleId -->
        <div v-if="!currentVehicleId" class="flex flex-col">
          <Field v-slot="{ value, handleChange }" name="vehicleId">
            <div>
              <VehicleSelect :value="value" @valueChange="handleChange" placeholder="Select a vehicle" />
              <ErrorMessage name="vehicleId" class="text-destructive mt-1 ml-2 text-sm" />
            </div>
          </Field>
        </div>

        <div class="border-border bg-input flex min-h-0 flex-1 flex-col space-y-2 rounded border">
          <!-- Editor Content -->
          <div class="flex h-full min-h-64 flex-1">
            <TipTapEditor
              :value="values.content"
              @update:value="(value: string) => setFieldValue('content', value)"
              :editable="true"
              :error="errors.content ?? undefined"
              class="px-3.5 pb-2"
            >
              <!-- Title Field -->
              <div>
                <Input
                  name="title"
                  type="text"
                  :autofocus="selectedVehicle !== null"
                  placeholder="Title"
                  maxlength="50"
                  class="flex-1"
                  input-class="bg-transparent border-none focus-visible:ring-0 px-0 text-2xl"
                />
                <span v-if="errors.title" class="text-destructive text-sm">{{ errors.title }}</span>
              </div>
            </TipTapEditor>
          </div>
        </div>

        <!-- Tags Field -->
        <div>
          <div class="space-y-2">
            <div class="flex gap-2">
              <input
                type="text"
                v-model="tagInput"
                placeholder="Lisää tägi"
                class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input focus-visible:border-ring focus-visible:ring-ring/50 flex w-full min-w-0 flex-1 appearance-none rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                @keydown.enter.prevent="handleAddTag"
              />
              <Button type="button" variant="outline" size="sm" @click="handleAddTag"> Lisää </Button>
            </div>

            <div v-if="values.tags && values.tags.length > 0" class="flex flex-wrap gap-2">
              <Badge v-for="(tag, index) in values.tags" :key="index" variant="secondary" class="px-2 py-1.5">
                {{ tag }}
                <button
                  type="button"
                  @click="handleRemoveTag(tag)"
                  class="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                >
                  <Icon name="close" class="h-3 w-3" />
                </button>
              </Badge>
            </div>
          </div>
          <span v-if="errors.tags" class="text-destructive text-sm">{{ errors.tags }}</span>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
