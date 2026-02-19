import { ref, watch, type Ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { toast } from "vue-sonner";
import type { Note, NoteSchemaType } from "@repo/validation";
import { isHtmlEmpty } from "@/lib/utils/html";

interface AutoSaveOptions {
  formValues: Ref<NoteSchemaType>;
  serverState: Ref<Note | undefined>;
  isFormDirty: Ref<boolean>;
  onSave: (noteId: string | undefined, data: NoteSchemaType) => Promise<Note>;
}

export function useNoteAutoSave(options: AutoSaveOptions) {
  const { formValues, serverState, isFormDirty, onSave } = options;

  const pendingSave = ref<{ noteId: string | undefined; data: NoteSchemaType } | null>(null);
  const isSaving = ref(false);

  // Check if note has actual changes worth saving
  function hasContentChanged(initial: Note | undefined, current: NoteSchemaType): boolean {
    if (!initial) return true;
    return (
      current.title !== initial.title ||
      current.content !== initial.content ||
      JSON.stringify([...(current.tags ?? [])].sort()) !== JSON.stringify([...(initial.tags ?? [])].sort())
    );
  }

  // Check if note has minimum required content
  function hasMinimumContent(note: NoteSchemaType): boolean {
    // Vehicle Id always required
    if (!note.vehicleId) return false;
    const hasTitle = !!(note.title && note.title.trim().length > 0);
    const hasContent = !isHtmlEmpty(note.content);
    return hasTitle || hasContent;
  }

  function shouldAutoSave(): boolean {
    if (!isFormDirty.value) return false;
    if (!hasContentChanged(serverState.value, formValues.value)) return false;
    if (!hasMinimumContent(formValues.value)) return false;
    return true;
  }

  // Perform the actual save
  async function executeSave() {
    if (!pendingSave.value || isSaving.value) return;

    isSaving.value = true;
    const saveData = pendingSave.value;

    try {
      const result = await onSave(saveData.noteId, saveData.data);

      // Update server state to match what we just saved
      serverState.value = result;
      pendingSave.value = null;
    } catch (error) {
      toast.error("Failed to save note", {
        description: (error as Error)?.message || "Unknown error",
        action: {
          label: "Retry",
          onClick: () => executeSave(),
        },
      });
      console.error("Auto-save failed:", error);
    } finally {
      isSaving.value = false;
    }
  }

  // Debounced save execution
  const debouncedSave = useDebounceFn(executeSave, 1500, { maxWait: 8000 });

  // Watch for form changes and queue saves
  watch(
    () => [formValues.value.title, formValues.value.content, formValues.value.tags, formValues.value.vehicleId],
    () => {
      if (shouldAutoSave()) {
        pendingSave.value = {
          noteId: serverState.value?.id || undefined,
          data: { ...formValues.value },
        };
        debouncedSave();
      } else {
        pendingSave.value = null;
      }
    },
  );

  // Handle page unload - save any pending changes
  function handleBeforeUnload() {
    if (!pendingSave.value) return;

    const endpoint = pendingSave.value.noteId === "new" ? "/api/notes" : `/api/notes/${pendingSave.value.noteId}`;

    const method = pendingSave.value.noteId === "new" ? "POST" : "PATCH";

    // Use keepalive to ensure request completes
    fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pendingSave.value.data),
      keepalive: true,
    });
  }

  return {
    pendingSave,
    isSaving,
    debouncedSave,
    handleBeforeUnload,
  };
}
