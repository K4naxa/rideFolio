<script lang="ts" setup>
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import TipTapEditor from "@/components/textEditor/TipTapEditor.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Input from "@/components/ui/input/Input.vue";
import { CheckIcon, SaveIcon, XIcon } from "lucide-vue-next";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { type NoteSchemaType, type Note, NoteSchema, newNote } from "@repo/validation";
import { computed, onUnmounted, ref, watch } from "vue";

import { useNoteQueries } from "@/lib/queries/useNoteQueries";
import { toTypedSchema } from "@vee-validate/zod";
import Button from "@/components/ui/button/Button.vue";
import { useDebounceFn } from "@vueuse/core";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { Icons } from "@/components/utility/icons";
import Separator from "@/components/ui/separator/Separator.vue";
import { useQueryClient } from "@tanstack/vue-query";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

const queryClient = useQueryClient();
const router = useRouter();

interface NoteSectionProps {
  noteId: Note["id"];
  vehicleId: Note["vehicle"]["id"];
}

const props = defineProps<NoteSectionProps>();

const {
  getEditableNote,
  createNoteAsync,
  updateNoteAsync,
  isCreating,
  isUpdating,
  isDeleting,
  deleteNoteAsync,
} = useNoteQueries();

const tagInput = ref("");
const isSubmitting = computed(() => isCreating.value || isUpdating.value || isDeleting.value);
const pendingSaves = ref(new Map<string, { noteId: Note["id"]; data: NoteSchemaType }>());
// If new, no query — otherwise fetch note
const currentNoteId = ref(props.noteId);
const isNew = computed(() => props.noteId === "new");
const noteQuery = getEditableNote(computed(() => props.noteId));
const lastServerState = ref<NoteSchemaType>(newNote({ vehicleId: props.vehicleId }));

const { values, errors, meta, setFieldValue, resetForm } = useForm<NoteSchemaType>({
  validationSchema: toTypedSchema(NoteSchema),
  initialValues: newNote({ vehicleId: props.vehicleId }),
});

// Watcher to keep our form in sync with prop changes
watch(
  () => [props.noteId, noteQuery.isLoading.value],
  () => {
    currentNoteId.value = props.noteId;
    debouncedSave;

    if (props.noteId === "new") {
      resetForm({
        values: newNote({ vehicleId: props.vehicleId }),
      });
      return;
    }

    // Skip while loading
    if (noteQuery.isLoading.value) return;
    lastServerState.value = noteQuery.data.value as NoteSchemaType;
    resetForm({
      values: noteQuery.data.value,
    });
  },
);

function handleDelete() {
  try {
    deleteNoteAsync({
      noteId: currentNoteId.value,
      vehicleId: values.vehicleId,
    });

    router.replace({
      query: { ...router.currentRoute.value.query, note: undefined },
    });
  } catch (error) {
    toast.error("Failed to delete note", {
      description: (error as Error)?.message || "Unknown error",
    });
  }
}
function handlePendingSaves() {
  pendingSaves.value.forEach(async (save) => {
    try {
      await saveNote(save.noteId, save.data);
      pendingSaves.value.delete(save.noteId);
    } catch (error) {
      console.error("Failed to save pending note:", error);
    }
  });
}
async function saveNote(noteId: Note["id"], saveData: NoteSchemaType) {
  try {
    if (noteId === "new") {
      const response = await createNoteAsync(saveData);
      currentNoteId.value = response.id;
      router.replace({
        query: { ...router.currentRoute.value.query, note: response.id },
      });
      // Update server state after successful save
      lastServerState.value = { ...saveData };
    } else {
      await updateNoteAsync({
        noteId: noteId,
        data: saveData,
      });

      // Update server state after successful save
      lastServerState.value = { ...saveData };
    }
  } catch (error) {
    toast.error("Something went wrong", {
      description: (error as Error)?.message || "Unknown error",
      action: {
        label: "Try again",
        onClick: () => saveNote(noteId, saveData),
      },
    });
    console.error("DeBounce: Failed to save note:", error);
  }
}

const debouncedSave = useDebounceFn(
  () => {
    handlePendingSaves();
  },
  2500,
  {
    maxWait: 10000,
  },
);

watch(
  () => [values.title, values.content, values.tags, values.pinned, values.vehicleId],
  () => {
    // Check if we should auto-save (compare against last server state)
    if (shouldAutoSave(lastServerState.value, values)) {
      pendingSaves.value.set(currentNoteId.value, {
        noteId: currentNoteId.value,
        data: { ...values },
      });
      debouncedSave();
    } else {
      pendingSaves.value.delete(currentNoteId.value);
    }

    // Eye candy: Immediately update caches on field changes
    if (currentNoteId.value) {
      // Immediately update all relevant caches
      queryClient.setQueryData<Note[]>(
        ["notes"],
        (old) =>
          old?.map((n) =>
            n.id === currentNoteId.value
              ? {
                  ...n,
                  title: values.title ?? null,
                  content: values.content ?? null,
                  pinned: values.pinned ?? false,
                  tags: values.tags ?? [],
                }
              : n,
          ) || [],
      );

      if (values.vehicleId) {
        queryClient.setQueryData<Note[]>(
          ["notes", "vehicle", values.vehicleId],
          (old) =>
            old?.map((n) =>
              n.id === currentNoteId.value
                ? {
                    ...n,
                    title: values.title ?? null,
                    content: values.content ?? null,
                    pinned: values.pinned ?? false,
                    tags: values.tags ?? [],
                  }
                : n,
            ) || [],
        );
      }
    }
  },
  { deep: true, flush: "pre" },
);

// TODO: add logic to check outside updates (other users) and refresh form data

function hasNoteChanged(initial: NoteSchemaType, current: NoteSchemaType): boolean {
  return (
    current.title !== initial.title ||
    current.content !== initial.content ||
    current.pinned !== initial.pinned ||
    JSON.stringify(current.tags) !== JSON.stringify(initial.tags)
  );
}

function shouldAutoSave(serverState: NoteSchemaType, current: NoteSchemaType): boolean {
  // Must have changes compared to last server state
  if (!hasNoteChanged(serverState, current)) {
    return false;
  }
  return meta.value.dirty;
}

// Fallback for page unloads
window.addEventListener("beforeunload", async () => {
  console.log("beforeunload triggered");
  if (pendingSaves.value.size > 1) {
    pendingSaves.value.forEach(async (save) => {
      const endpoint = save.noteId === "new" ? "/api/notes" : `/api/notes/${save.noteId}`;
      const method = save.noteId === "new" ? "POST" : "PATCH";

      fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(save.data),
        keepalive: true, // keeps request alive after page unload
      });

      queryClient.invalidateQueries({
        queryKey: ["notes", "vehicle", save.data.vehicleId],
      });
    });
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  }
});
onUnmounted(() => {
  window.removeEventListener("beforeunload", () => {});
});

const handleAddTag = () => {
  const trimmedTag = tagInput.value.trim();
  const currentTags = values.tags || [];
  if (trimmedTag !== "" && !currentTags.includes(trimmedTag)) {
    setFieldValue("tags", [...currentTags, trimmedTag]);
    tagInput.value = "";
  }
};

const handleRemoveTag = (tagToRemove: string) => {
  const currentTags = values.tags || [];
  setFieldValue(
    "tags",
    currentTags.filter((tag) => tag !== tagToRemove),
  );
};
</script>

<template>
  <div
    class="absolute bg-background p-4 lg:p-0 lg:relative z-50 lg:z-0 top-0 left-0 lg:flex flex-col w-full flex-1 min-h-0"
  >
    <form class="flex flex-col space-y-4 flex-1 min-h-0" @submit.prevent>
      <!-- Vehicle Selection - Only show when creating new note without activeVehicleId -->

      <Field v-slot="{ value, handleChange }" name="vehicleId">
        <div v-if="isNew && !props.vehicleId">
          <VehicleSelect
            :value="value"
            @valueChange="handleChange"
            placeholder="Select a vehicle"
          />
          <ErrorMessage name="vehicleId" class="text-sm text-destructive mt-1 ml-2" />
        </div>
      </Field>

      <header class="flex items-center justify-between">
        {{ !isNew ? "Edit Note" : "Create Note" }}
        <div class="flex items-center gap-4">
          <!-- Status indicator -->
          <div class="aspect-square border rounded-sm w-9 grid place-items-center">
            <div v-if="isSubmitting"><Spinner class="size-4" /></div>
            <div v-else-if="pendingSaves.has(currentNoteId)">
              <SaveIcon class="size-4 stroke-warning" />
            </div>
            <div v-else><CheckIcon class="size-4 stroke-success" /></div>
          </div>

          <!-- control buttons -->
          <div v-if="!isNew" class="flex gap-2">
            <Separator orientation="vertical" class="mx-2 w-1" />
            <Button
              variant="outline"
              size="icon"
              class="stroke-muted-foreground hover:bg-destructive/20 hover:stroke-destructive"
              @click="handleDelete"
              ><Icons.trash className="stroke-inherit"
            /></Button>
            <Button
              variant="outline"
              size="icon"
              class="group"
              @click="setFieldValue('pinned', !values.pinned)"
            >
              <Icons.pin v-if="!values.pinned" className="" />
              <Icons.pin v-if="values.pinned" className="group-hover:hidden stroke-primary" />
              <Icons.pinOff
                v-if="values.pinned"
                className="hidden group-hover:block stroke-primary"
              />
            </Button>
          </div>
        </div>
      </header>

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
              :validate-on-blur="false"
            />
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
              variant="outline"
              class="text-sm px-3 py-1.5"
            >
              {{ tag }}
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                class="ml-2"
                @click="handleRemoveTag(tag)"
              >
                <XIcon class="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        </div>
        <span v-if="errors.tags" class="text-sm text-destructive">{{ errors.tags }}</span>
      </div>
    </form>
  </div>
</template>
