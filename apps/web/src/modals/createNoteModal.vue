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
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { useAccessibleVehicles } from "@/lib/queries/useAccessibleVehicles";
import Input from "@/components/ui/input/Input.vue";
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import { watchDebounced } from "@vueuse/core";
import { useNoteQueries } from "@/lib/queries/useNoteQueries";
import { XIcon } from "lucide-vue-next";
import TipTapEditor from "@/components/textEditor/TipTapEditor.vue";

const modalStore = useModalStore();

// Computed properties
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createNote");
const initialNote = computed(() => modalStore.data as Note | null);

console.log("Initial note in modal:", initialNote.value);
console.log("Initial note values in modal:", {
  vehicleId: initialNote.value?.vehicle.id,
  title: initialNote.value?.title,
  content: initialNote.value?.content,
  pinned: initialNote.value?.pinned,
  tags: initialNote.value?.tags,
});

const { values, errors, setFieldValue, resetForm, meta } = useForm<NoteSchemaType>({
  initialValues: {
    vehicleId: initialNote.value?.vehicle.id || "",
    title: initialNote.value?.title || "",
    content: initialNote.value?.content || "",
    pinned: initialNote.value?.pinned || false,
    tags: initialNote.value?.tags || [],
  },
});

const selectedVehicle = computed(() => {
  if (values.vehicleId) {
    return accessibleVehicles.value?.find((v) => v.vehicleData.id === values.vehicleId) || null;
  }
  return null;
});
const { activeVehicleId } = useActiveVehicle();
const { data: accessibleVehicles } = useAccessibleVehicles();

const { createNoteAsync, updateNoteAsync, deleteNote } = useNoteQueries(
  selectedVehicle.value?.vehicleData.id,
);

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
  } else if (activeVehicleId.value) {
    // Creating new note with active vehicle
    resetForm({
      values: {
        vehicleId: activeVehicleId.value,
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
    <DialogContent class="max-w-4xl lg:max-h-[90vh] flex flex-col min-h-0">
      <DialogHeader class="flex flex-row justify-between w-full gap-2">
        <DialogTitle class="flex items-center gap-2"> Create Note </DialogTitle>
        <Button v-if="!initialNote" variant="outline" @click="handleCancel">Cancel</Button>
        <div></div>
      </DialogHeader>

      <form class="space-y-4 min-h-0 flex flex-col" @submit.prevent>
        <!-- Vehicle Selection - Only show when creating new note without activeVehicleId -->
        <div v-if="!activeVehicleId" class="flex flex-col">
          <Field v-slot="{ value, handleChange }" name="vehicleId">
            <div>
              <VehicleSelect
                :value="value"
                @valueChange="handleChange"
                placeholder="Select a vehicle"
              />
              <ErrorMessage name="vehicleId" class="text-sm text-destructive mt-1 ml-2" />
            </div>
          </Field>
        </div>

        <div class="border border-border rounded bg-input flex flex-col flex-1 space-y-2 min-h-0">
          <!-- Editor Content -->
          <div class="flex h-full min-h-64 flex-1">
            <TipTapEditor
              :value="values.content"
              @update:value="(value) => setFieldValue('content', value)"
              :editable="true"
              :error="errors.content ?? undefined"
              class="pb-2 px-3.5"
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
                <span v-if="errors.title" class="text-sm text-destructive">{{ errors.title }}</span>
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
                class="flex-1 appearance-none file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border flex w-full min-w-0 rounded-md bg-input px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2"
                @keydown.enter.prevent="handleAddTag"
              />
              <Button type="button" variant="outline" size="sm" @click="handleAddTag">
                Lisää
              </Button>
            </div>

            <div v-if="values.tags && values.tags.length > 0" class="flex flex-wrap gap-2">
              <Badge
                v-for="(tag, index) in values.tags"
                :key="index"
                variant="secondary"
                class="px-2 py-1.5"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="handleRemoveTag(tag)"
                  class="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                >
                  <XIcon class="h-3 w-3" />
                </button>
              </Badge>
            </div>
          </div>
          <span v-if="errors.tags" class="text-sm text-destructive">{{ errors.tags }}</span>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
