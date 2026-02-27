<script lang="ts" setup>
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import Input from "@/components/ui/input/Input.vue";
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Icon from "@/components/icons/Icon.vue";
import { CheckIcon, SaveIcon } from "lucide-vue-next";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { type Note, NoteSchema, type NoteSchemaType } from "@repo/validation";
import { computed, onUnmounted, ref, useSlots, watch } from "vue";
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
  created: [Note];
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

const isPinned = computed(() => lastServerState.value?.pinned || false);

// Form setup
const { values, errors, meta, setFieldValue, resetForm } = useForm<NoteSchemaType>({
  validationSchema: toTypedSchema(NoteSchema),
  initialValues: {
    title: props.note?.title || "",
    content: props.note?.content || "",
    vehicleId: props.note?.vehicle.id || currentVehicleId.value || "",
  },
});

// Save handler for auto-save
async function handleSave(noteId: string | undefined, data: NoteSchemaType): Promise<Note> {
  let savedNote: Note;

  // We have no previous server state, so this must be a new note - create it
  if (!noteId) {
    savedNote = await createNote(data);
    // Update local state with the newly created note
    lastServerState.value = savedNote;
    // Notify parent that a note was created
    emit("created", savedNote);
  } else {
    // Otherwise, update the existing note
    savedNote = await updateNote({ noteId, data });
    lastServerState.value = savedNote;
  }

  return savedNote;
}

// Auto-save setup
const { pendingSaves, isSaving, handleBeforeUnload } = useNoteAutoSave({
  formValues: computed(() => values),
  serverState: lastServerState,
  isFormDirty: computed(() => meta.value.dirty),
  onSave: handleSave,
});

// Status indicator
const saveStatus = computed<"saving" | "pending" | "saved" | "invalid">(() => {
  if (isCreating.value || isUpdating.value || isDeleting.value || isSaving.value) {
    return "saving";
  } else if (pendingSaves.value.has(lastServerState.value?.id)) {
    return "pending";
  } else if (errors.value && Object.keys(errors.value).length > 0) {
    return "invalid";
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

async function handleTogglePin() {
  if (!lastServerState.value) return;
  const updatedNote = await togglePinNote({ noteId: lastServerState.value?.id, pinned: !isPinned.value });
  lastServerState.value = updatedNote;
}

function handleClose() {
  emit("close");
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
        },
      });
    } else {
      lastServerState.value = newNote;
      resetForm({
        values: {
          title: newNote.title,
          content: newNote.content,
          vehicleId: newNote.vehicle.id,
        },
      });
    }
  },
);
</script>

<template>
  <div class="bg-background mx-auto flex min-h-0 w-full max-w-5xl min-w-0 flex-1 flex-col p-0">
    <form class="flex min-h-0 min-w-0 flex-1 flex-col space-y-4" @submit.prevent>
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
      <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <TipTapEditor
          v-slot="{ focus }"
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
              @keydown.enter.prevent="focus()"
            />
          </div>
        </TipTapEditor>
      </div>
    </form>
  </div>
</template>
