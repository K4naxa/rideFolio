<script lang="ts" setup>
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Input from "@/components/ui/input/Input.vue";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Icon from "@/components/icons/Icon.vue";
import { CheckIcon, SaveIcon, XIcon } from "lucide-vue-next";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { type NoteSchemaType, type Note, NoteSchema } from "@repo/validation";
import { computed, onMounted, onUnmounted, ref, watch, useSlots } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { useCreateNote, useDeleteNote, useTogglePinNote, useUpdateNote } from "@/lib/queries/notes/note-mutations";
import TipTapEditor from "@/components/notes/textEditor/TipTapEditor.vue";
import { useNoteAutoSave } from "@/modals/composables/useNoteAutoSave";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";

interface NoteSectionProps {
  note: Note | undefined;
}

const props = defineProps<NoteSectionProps>();
const emit = defineEmits<{
  close: [];
  deleted: [];
}>();

const { currentVehicleId } = useCurrentVehicle();

const slots = useSlots();
const router = useRouter();

// Queries and mutations
const { mutateAsync: createNote, isPending: isCreating } = useCreateNote();
const { mutateAsync: togglePinNote } = useTogglePinNote();
const { mutateAsync: deleteNote, isPending: isDeleting } = useDeleteNote();
const { mutateAsync: updateNote, isPending: isUpdating } = useUpdateNote();

// Component state
const isNew = computed(() => !props.note?.id);
const hasHeaderSlot = computed(() => !!slots.header);
const tagInput = ref("");

// Keep track of last server state to determine if there are unsaved changes
// This gets updated on every successful save, and is used to compare against form values to determine if there are changes worth saving
const lastServerState = ref<Note | undefined>(props.note);

const isPinned = computed(() => props.note?.pinned || false);

// Form setup
const { values, errors, meta, setFieldValue, resetForm } = useForm<NoteSchemaType>({
  validationSchema: toTypedSchema(NoteSchema),
  initialValues: {
    title: props.note?.title || "",
    content: props.note?.content || "",
    vehicleId: props.note?.vehicle.id || currentVehicleId.value || "",
    tags: props.note?.tags || [],
  },
});

// Save handler for auto-save
async function handleSave(noteId: string | undefined, data: NoteSchemaType): Promise<Note> {
  // We have no previous server state, so this must be a new note - create it
  if (!noteId) {
    return await createNote(data);
  } else {
    // Otherwise, update the existing note
    return await updateNote({ noteId, data });
  }
}

// Auto-save setup
const { pendingSave, isSaving, handleBeforeUnload } = useNoteAutoSave({
  formValues: computed(() => values),
  serverState: lastServerState,
  isFormDirty: computed(() => meta.value.dirty),
  onSave: handleSave,
});

// Status indicator
const saveStatus = computed<"saving" | "pending" | "saved">(() => {
  if (isCreating.value || isUpdating.value || isDeleting.value || isSaving.value) {
    return "saving";
  }
  if (pendingSave.value) {
    return "pending";
  }
  return "saved";
});

// Action handlers
async function handleDelete() {
  if (!lastServerState.value) return;
  try {
    await deleteNote({
      noteId: lastServerState.value.id,
      vehicleId: values.vehicleId,
    });

    emit("deleted");

    if (!hasHeaderSlot.value) {
      router.replace({
        query: { ...router.currentRoute.value.query, note: undefined },
      });
    }
  } catch (error) {
    toast.error("Failed to delete note", {
      description: (error as Error)?.message || "Unknown error",
    });
  }
}

function handleTogglePin() {
  if (!lastServerState.value) return;
  togglePinNote({ noteId: lastServerState.value?.id, pinned: !isPinned.value });
}

function handleClose() {
  emit("close");
}

// Tag management
function handleAddTag() {
  const trimmedTag = tagInput.value.trim().toLowerCase();
  const currentTags = values.tags || [];
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

// Only add beforeunload in standalone mode
if (!hasHeaderSlot.value) {
  window.addEventListener("beforeunload", handleBeforeUnload);
  onUnmounted(() => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  });
}

// Expose for parent if needed
defineExpose({
  saveStatus,
  values,
});

// Reset form whenever the note prop changes (i.e. when selecting a different note from the list)
watch(
  () => props.note,
  (newNote) => {
    //
    if (!newNote) {
      lastServerState.value = undefined;
      resetForm({
        values: {
          title: "",
          content: "",
          vehicleId: currentVehicleId.value || "",
          tags: [],
        },
      });
    } else {
      lastServerState.value = newNote;
      resetForm({
        values: {
          title: newNote.title,
          content: newNote.content,
          vehicleId: newNote.vehicle.id,
          tags: newNote.tags,
        },
      });
    }
  },
);
</script>

<template>
  <div class="bg-background mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col p-0">
    <form class="flex min-h-0 flex-1 flex-col space-y-4" @submit.prevent>
      <!-- Header Slot with all controls/status exposed -->
      <slot
        name="header"
        :is-new="isNew"
        :is-pinned="isPinned"
        :is-deleting="isDeleting"
        :save-status="saveStatus"
        :on-delete="handleDelete"
        :on-toggle-pin="handleTogglePin"
        :on-close="handleClose"
      >
        <header class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">{{ isNew ? "New Note" : "Edit Note" }}</h2>
          <div class="flex items-center gap-4">
            <!-- Status indicator -->
            <div class="grid aspect-square w-9 place-items-center rounded-sm border">
              <Spinner v-if="saveStatus === 'saving'" class="size-4" />
              <SaveIcon v-else-if="saveStatus === 'pending'" class="stroke-warning size-4" />
              <CheckIcon v-else class="stroke-success size-4" />
            </div>

            <!-- Control buttons -->
            <template v-if="!isNew">
              <Separator orientation="vertical" class="mx-2 h-6" />
              <div class="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  class="stroke-muted-foreground hover:bg-destructive/20 hover:stroke-destructive"
                  @click="handleDelete"
                >
                  <Icon name="trash" class="stroke-inherit" />
                </Button>

                <Button variant="outline" size="icon" class="group" @click="handleTogglePin">
                  <Icon v-if="!isPinned" name="pin" class="group-hover:stroke-primary" />
                  <Icon v-if="isPinned" name="pin" class="stroke-primary group-hover:hidden" />
                  <Icon v-if="isPinned" name="pinOff" class="stroke-primary hidden group-hover:block" />
                </Button>
              </div>
            </template>
          </div>
        </header>
      </slot>

      <!-- Vehicle Selection -->
      <Field v-slot="{ value, handleChange }" name="vehicleId">
        <div v-if="isNew && !currentVehicleId">
          <VehicleSelect :value="value" @valueChange="handleChange" placeholder="Select a vehicle" />
          <ErrorMessage name="vehicleId" class="text-destructive mt-1 ml-2 text-sm" />
        </div>
      </Field>

      <!-- Editor -->
      <div class="flex min-h-0 flex-1 flex-col">
        <TipTapEditor
          :value="values.content"
          @update:value="(value: string) => setFieldValue('content', value)"
          placeholder="Write your note here..."
          :editable="true"
          :error="errors.content ?? undefined"
          class="min-h-40"
        >
          <div>
            <Input
              name="title"
              type="text"
              placeholder="Title"
              maxlength="50"
              class="flex-1"
              input-class="bg-transparent border-none focus-visible:ring-0 px-0 text-2xl shadow-none"
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
