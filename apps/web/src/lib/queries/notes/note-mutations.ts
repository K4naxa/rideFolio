import { api } from "@/lib/api";
import { useNoteCacheSync } from "@/lib/queries/notes/useNoteCacheSync";
import type { EditableNote, Note, NoteSchemaType } from "@repo/validation";
import { useMutation } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useCreateNote() {
  const { syncNewNoteToCache } = useNoteCacheSync();
  return useMutation({
    mutationKey: ["create-note"],
    mutationFn: async (data: NoteSchemaType) => {
      const response = await api.post<Note>("/notes", data);
      return response.data;
    },
    onSuccess: (data) => {
      syncNewNoteToCache(data);
      toast.success("Note created successfully");
    },
    onError: (error) => {
      toast.error("Error creating the Note");
      console.error("NOTE API ERROR: ", error);
    },
  });
}

export function useUpdateNote() {
  const { syncNoteToCache } = useNoteCacheSync();
  return useMutation({
    mutationKey: ["update-note"],
    mutationFn: async ({ noteId, data }: { noteId: Note["id"]; data: NoteSchemaType }) => {
      const response = await api.patch<EditableNote>(`/notes/${noteId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      syncNoteToCache(data.id, data);
      toast.success("Note updated successfully");
    },
    onError: (error) => {
      toast.error("Error updating the Note");
      console.error("NOTE API ERROR: ", error);
    },
  });
}

export function useDeleteNote() {
  const { syncDeletedNoteFromCache } = useNoteCacheSync();
  return useMutation({
    mutationKey: ["delete-note"],
    mutationFn: async ({ noteId }: { noteId: Note["id"]; vehicleId?: Note["vehicle"]["id"] }) => {
      const response = await api.delete<{ success: boolean }>(`/notes/${noteId}`);
      return { ...response.data, noteId }; // Return noteId for onSuccess
    },
    onSuccess: (data) => {
      syncDeletedNoteFromCache(data.noteId);
      toast.success("Note deleted successfully");
    },
    onError: (error) => {
      toast.error("Error deleting the Note");
      console.error("NOTE API ERROR: ", error);
    },
  });
}

export function useTogglePinNote() {
  const { syncNoteToCache } = useNoteCacheSync();
  return useMutation({
    mutationKey: ["toggle-pin-note"],
    mutationFn: async ({ noteId, pinned }: { noteId: Note["id"]; pinned: Note["pinned"] }) => {
      const response = await api.patch<EditableNote>(`/notes/${noteId}/pin`, {
        pinned,
      });
      return response.data;
    },
    onSuccess: (data) => {
      syncNoteToCache(data.id, data);
      toast.success(`Note ${data.pinned ? "pinned" : "unpinned"}`);
    },
    onError: (error) => {
      toast.error("Error toggling pin on the Note");
      console.error("NOTE PIN API ERROR: ", error);
    },
  });
}
