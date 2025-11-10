<script lang="ts" setup>
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import TipTapEditor from "@/components/textEditor/TipTapEditor.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Input from "@/components/ui/input/Input.vue";
import { XIcon } from "lucide-vue-next";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { type NoteSchemaType, type Note, NoteSchema } from "@repo/validation";
import { ref } from "vue";

import { useNoteQueries } from "@/lib/queries/useNoteQueries";
import { toTypedSchema } from "@vee-validate/zod";
import Button from "@/components/ui/button/Button.vue";
import { watchDebounced } from "@vueuse/core";

const props = defineProps<{
  note: Note;
}>();

const tagInput = ref("");
const isSubmitting = ref(false);
const createdNoteId = ref<string | null>(props.note.id);
const { createNoteAsync, updateNoteAsync } = useNoteQueries();

const { values, errors, meta, setFieldValue } = useForm<NoteSchemaType>({
  validationSchema: toTypedSchema(NoteSchema),
  initialValues: {
    vehicleId: props.note.vehicle.id,
    title: props.note.title,
    content: props.note.content,
    pinned: props.note.pinned,
    tags: props.note.tags || [],
  },
});

watchDebounced(
  () => [values.title, values.content, values.tags],
  async () => {
    // Only auto-save if we have required fields filled
    if (!meta.value.dirty) {
      return;
    }

    try {
      isSubmitting.value = true;
      console.log(
        "autosaving, deciding if to create or update. createdNoteId:",
        createdNoteId.value,
      );

      if (!createdNoteId.value) {
        // Create new note
        const response = await createNoteAsync(values);
        console.log("Auto-saved new note with ID:", response.id);
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

    return () => {};
  },
  {
    debounce: 2500,
    maxWait: 10000,
    immediate: true,
    deep: true,
  },
);

const handleAddTag = () => {
  const trimmedTag = tagInput.value.trim();
  if (trimmedTag !== "" && !values.tags.includes(trimmedTag)) {
    setFieldValue("tags", [...values.tags, trimmedTag]);
    tagInput.value = "";
  }
};

const handleRemoveTag = (tagToRemove: string) => {
  setFieldValue(
    "tags",
    values.tags.filter((tag) => tag !== tagToRemove),
  );
};

// Eeye candy: Immediately update caches on field changes
// watch(
//   () => [values.tags, values.title, values.pinned, values.content],
//   () => {
//     const updatedNote = {
//       ...props.note,
//       title: values.title,
//       content: values.content,
//       pinned: values.pinned,
//       tags: values.tags,
//     };

//     // Immediately update all relevant caches
//     queryClient.setQueryData<Note[]>(
//       ["notes"],
//       (old) => old?.map((note) => (note.id === createdNoteId.value ? updatedNote : note)) || [],
//     );

//     queryClient.setQueryData<Note>(["notes", createdNoteId.value], updatedNote);

//     if (values.vehicleId) {
//       queryClient.setQueryData<Note[]>(
//         ["notes", "vehicle", values.vehicleId],
//         (old) => old?.map((note) => (note.id === createdNoteId.value ? updatedNote : note)) || [],
//       );
//     }
//   },
// );
</script>

<template>
  <div class="flex flex-col w-full flex-1 min-h-0">
    <form class="flex flex-col space-y-4 flex-1 min-h-0" @submit.prevent>
      <!-- Vehicle Selection - Only show when creating new note without activeVehicleId -->

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

      <!-- Make this container flex with full height -->
      <div class="flex flex-col flex-1 min-h-0">
        <!-- or min-h-[60vh] -->
        <TipTapEditor
          :value="values.content"
          @update:value="(value) => setFieldValue('content', value)"
          placeholder="Write your note here..."
          :editable="true"
          :error="errors.content ?? undefined"
        >
          <!-- Title Field -->
          <div>
            <Input
              name="title"
              type="text"
              placeholder="Title"
              maxlength="50"
              class="flex-1"
              input-class="bg-transparent border-none focus-visible:ring-0 px-0 text-2xl"
            />
            <span v-if="errors.title" class="text-sm text-destructive">{{ errors.title }}</span>
          </div>
        </TipTapEditor>
      </div>

      <!-- Tags Field -->
      <div class="mt-auto">
        <div class="space-y-2">
          <div class="flex gap-2 items-center">
            <input
              type="text"
              v-model="tagInput"
              placeholder="Add a tag"
              class="flex-1 appearance-none file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border flex w-full min-w-0 rounded-md bg-input px-3 py-1.5 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2"
              @keydown.enter.prevent="handleAddTag"
            />
            <Button type="button" variant="outline" @click="handleAddTag" class="h-full">
              Add
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
  </div>
</template>
