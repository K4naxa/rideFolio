import { ref, type Ref, watch } from "vue";
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

  const pendingSaves = ref(new Map<string | undefined, NoteSchemaType>());
  const isSaving = ref(false);

  // Check if the note has actual changes worth saving
  function hasContentChanged(initial: Note | undefined, current: NoteSchemaType): boolean {
    if (!initial) return true;
    return current.title !== initial.title || current.content !== initial.content;
  }

  // Check if the note has minimum required content
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
    return hasMinimumContent(formValues.value);
  }

  // Perform the actual save
  async function executeSave() {
    if (!pendingSaves.value.size || isSaving.value) return;

    isSaving.value = true;
    for (const [noteId, data] of pendingSaves.value.entries()) {
      try {
        // Update the server state to match what we just saved
        serverState.value = await onSave(noteId, data);
        pendingSaves.value.delete(noteId);
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
  }

  // Debounced save execution
  const debouncedSave = useDebounceFn(executeSave, 1500, { maxWait: 8000 });

  // Watch for form changes and queue saves
  watch(
    () => [formValues.value.title, formValues.value.content, formValues.value.vehicleId],
    () => {
      if (shouldAutoSave()) {
        pendingSaves.value.set(serverState.value?.id || undefined, { ...formValues.value });
        debouncedSave();
      } else {
        pendingSaves.value.delete(serverState.value?.id || undefined);
      }
    },
  );

  // Handle page unload - save any pending changes
  function handleBeforeUnload() {
    if (!pendingSaves.value.size) return;

    for (const [noteId, data] of pendingSaves.value.entries()) {
      const endpoint = noteId === "new" ? "/api/notes" : `/api/notes/${noteId}`;

      const method = noteId === "new" ? "POST" : "PATCH";

      // Use keepalive to ensure request completes
      fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        keepalive: true,
      });
    }
  }

  return {
    pendingSaves,
    isSaving,
    debouncedSave,
    handleBeforeUnload,
  };
}
