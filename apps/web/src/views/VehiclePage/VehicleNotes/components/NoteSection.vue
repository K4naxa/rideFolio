<script lang="ts" setup>
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import TipTapEditor from "@/components/textEditor/TipTapEditor.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Input from "@/components/ui/input/Input.vue";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Icon from "@/components/icons/Icon.vue";
import { CheckIcon, SaveIcon, XIcon } from "lucide-vue-next";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { type NoteSchemaType, type Note, NoteSchema, newNote } from "@repo/validation";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { useNoteAutoSave } from "../composables/useNoteAutoSave";
import { useEditableNote } from "@/lib/queries/notes/note-queries";
import { useCreateNote, useDeleteNote, useTogglePinNote, useUpdateNote } from "@/lib/queries/notes/note-mutations";

interface NoteSectionProps {
  noteId: Note["id"];
  vehicleId: Note["vehicle"]["id"];
}

const props = defineProps<NoteSectionProps>();
const router = useRouter();

// Queries and mutations
const { mutateAsync: createNote, isPending: isCreating } = useCreateNote();
const { mutateAsync: togglePinNote } = useTogglePinNote();
const { mutateAsync: deleteNote, isPending: isDeleting } = useDeleteNote();
const { mutateAsync: updateNote, isPending: isUpdating } = useUpdateNote();

const { data: editableNote, isLoading } = useEditableNote(computed(() => props.noteId));

// Component state
const currentNoteId = ref(props.noteId);
const isNew = computed(() => props.noteId === "new");
const tagInput = ref("");
const lastServerState = ref<NoteSchemaType>(newNote({ vehicleId: props.vehicleId }));

// Query for existing note
const isPinned = computed(() => editableNote.value?.pinned || false);

// Form setup
const { values, errors, meta, setFieldValue, resetForm } = useForm<NoteSchemaType>({
  validationSchema: toTypedSchema(NoteSchema),
  initialValues: newNote({ vehicleId: props.vehicleId }),
});

// Initialize form data
function initializeForm() {
  if (props.noteId === "new") {
    const initialData = newNote({ vehicleId: props.vehicleId });
    lastServerState.value = initialData;
    resetForm({ values: initialData });
    return;
  }

  // Wait for data to be available
  if (isLoading.value || !editableNote.value) return;

  lastServerState.value = editableNote.value as NoteSchemaType;
  resetForm({ values: editableNote.value });
}

// Save handler for auto-save
async function handleSave(noteId: Note["id"], data: NoteSchemaType) {
  if (noteId === "new") {
    const response = await createNote(data);
    currentNoteId.value = response.id;

    // Update URL with new note ID
    router.replace({
      query: { ...router.currentRoute.value.query, note: response.id },
    });

    return response;
  } else {
    await updateNote({ noteId, data });
    return;
  }
}

// Handle note ID changes from auto-save
function handleNoteIdChange(newId: Note["id"]) {
  currentNoteId.value = newId;
}

// Auto-save setup
const { pendingSave, isSaving, handleBeforeUnload } = useNoteAutoSave({
  noteId: currentNoteId,
  formValues: computed(() => values),
  serverState: lastServerState,
  isFormDirty: computed(() => meta.value.dirty),
  onSave: handleSave,
  onNoteIdChange: handleNoteIdChange,
});

// Status indicator
const saveStatus = computed(() => {
  if (isCreating.value || isUpdating.value || isDeleting.value || isSaving.value) {
    return "saving";
  }
  if (pendingSave.value) {
    return "pending";
  }
  return "saved";
});

// Delete handler
async function handleDelete() {
  try {
    await deleteNote({
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

// Tag management
function handleAddTag() {
  const trimmedTag = tagInput.value.trim().toLowerCase();
  const currentTags = values.tags || [];

  // Case-insensitive duplicate check
  const tagExists = currentTags.some((tag) => tag.toLowerCase() === trimmedTag);

  if (trimmedTag && !tagExists) {
    setFieldValue("tags", [...currentTags, tagInput.value.trim()]);
    tagInput.value = "";
  }
}

function handleRemoveTag(tagToRemove: string) {
  const currentTags = values.tags || [];
  setFieldValue(
    "tags",
    currentTags.filter((tag) => tag !== tagToRemove),
  );
}

// Lifecycle hooks
onMounted(() => {
  initializeForm();
});

// Watch for prop changes
watch(
  () => [props.noteId, isLoading.value, editableNote.value],
  () => {
    currentNoteId.value = props.noteId;
    initializeForm();
  },
);

// Page unload handling
window.addEventListener("beforeunload", handleBeforeUnload);

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<template>
  <div
    class="bg-background absolute top-0 left-0 z-50 min-h-0 w-full flex-1 flex-col p-4 lg:relative lg:z-0 lg:flex lg:p-0"
  >
    <form class="flex min-h-0 flex-1 flex-col space-y-4" @submit.prevent>
      <!-- Vehicle Selection -->
      <Field v-slot="{ value, handleChange }" name="vehicleId">
        <div v-if="isNew && !props.vehicleId">
          <VehicleSelect :value="value" @valueChange="handleChange" placeholder="Select a vehicle" />
          <ErrorMessage name="vehicleId" class="text-destructive mt-1 ml-2 text-sm" />
        </div>
      </Field>

      <header class="flex items-center justify-between">
        {{ !isNew ? "Edit Note" : "Create Note" }}
        <div class="flex items-center gap-4">
          <!-- Status indicator -->
          <div class="grid aspect-square w-9 place-items-center rounded-sm border">
            <Spinner v-if="saveStatus === 'saving'" class="size-4" />
            <SaveIcon v-else-if="saveStatus === 'pending'" class="stroke-warning size-4" />
            <CheckIcon v-else class="stroke-success size-4" />
          </div>

          <!-- Control buttons -->
          <template v-if="!isNew">
            <Separator orientation="vertical" class="mx-2 w-1" />
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                class="stroke-muted-foreground hover:bg-destructive/20 hover:stroke-destructive"
                @click="handleDelete"
              >
                <Icon name="trash" className="stroke-inherit" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                class="group"
                @click="togglePinNote({ noteId: currentNoteId, pinned: !isPinned })"
              >
                <Icon v-if="!isPinned" name="pin" class="group-hover:stroke-primary" />
                <Icon v-if="isPinned" name="pin" class="stroke-primary group-hover:hidden" />
                <Icon v-if="isPinned" name="pinOff" class="stroke-primary hidden group-hover:block" />
              </Button>
            </div>
          </template>
        </div>
      </header>

      <!-- Editor -->
      <div class="flex min-h-0 flex-1 flex-col">
        <TipTapEditor
          :value="values.content"
          @update:value="(value: string) => setFieldValue('content', value)"
          placeholder="Write your note here..."
          :editable="true"
          :error="errors.content ?? undefined"
        >
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

      <!-- Tags -->
      <div class="mt-auto">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <input
              type="text"
              v-model="tagInput"
              placeholder="Add a tag"
              class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input focus-visible:border-ring focus-visible:ring-ring/50 flex w-full min-w-0 flex-1 appearance-none rounded-md border px-3 py-1.5 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              @keydown.enter.prevent="handleAddTag"
            />
            <Button type="button" variant="outline" @click="handleAddTag" class="h-full"> Add </Button>
          </div>

          <div v-if="values.tags?.length" class="flex flex-wrap gap-2">
            <Badge v-for="(tag, index) in values.tags" :key="index" variant="outline" class="px-3 py-1.5 text-sm">
              {{ tag }}
              <Button variant="ghost" size="icon-sm" type="button" class="ml-2" @click="handleRemoveTag(tag)">
                <XIcon class="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        </div>
        <span v-if="errors.tags" class="text-destructive text-sm">{{ errors.tags }}</span>
      </div>
    </form>
  </div>
</template>
