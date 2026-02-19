import { useQueryClient } from "@tanstack/vue-query";
import type { Note, NoteSchemaType } from "@repo/validation";
import { queryKeys } from "@/lib/queries/queryKeys";

export function useNoteCacheSync() {
  const queryClient = useQueryClient();

  function sortNotes(notes: Note[]) {
    return [...notes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const aDate = new Date(a.updatedAt);
      const bDate = new Date(b.updatedAt);
      return bDate.getTime() - aDate.getTime();
    });
  }

  // Update cache after successful save (not on every keystroke)
  function syncNoteToCache(updatedNote: Note) {
    // update specific note cache
    queryClient.setQueryData<Note>(queryKeys.notes.byId(updatedNote.id), (old) => {
      if (!old) return old;
      return updatedNote;
    });

    // Update global notes cache
    queryClient.setQueryData<Note[]>(queryKeys.notes.all, (old) => {
      if (!old) return old;
      const updatedNotes = old.map((n) => (n.id === updatedNote.id ? updatedNote : n));
      return sortNotes(updatedNotes);
    });

    // Update vehicle-specific cache if vehicleId exists
    if (updatedNote.vehicle.id) {
      queryClient.setQueryData<Note[]>(queryKeys.notes.byVehicle(updatedNote.vehicle.id), (old) => {
        if (!old) return old;
        const updatedNotes = old.map((n) => (n.id === updatedNote.id ? updatedNote : n));
        return sortNotes(updatedNotes);
      });
    }
  }

  function syncNewNoteToCache(newNote: Note) {
    // Add to global notes cache
    queryClient.setQueryData<Note[]>(queryKeys.notes.all, (old) => {
      if (!old) return old;
      return sortNotes([newNote, ...old]);
    });
    // Add to vehicle-specific cache
    queryClient.setQueryData<Note[]>(queryKeys.notes.byVehicle(newNote.vehicle.id), (old) => {
      if (!old) return old;
      return sortNotes([newNote, ...old]);
    });

    queryClient.setQueryData<Note>(queryKeys.notes.byId(newNote.id), () => newNote);

    // Set the query as fresh for 3 seconds to prevent immediate refetch
    queryClient.setQueryDefaults(queryKeys.notes.editable(newNote.id), {
      staleTime: 3000,
    });
  }

  function syncDeletedNoteFromCache(deletedNoteId: Note["id"]) {
    queryClient.setQueriesData({ queryKey: queryKeys.notes.all }, (old: Note[] | undefined) => {
      if (!old) return old;
      if (Array.isArray(old)) return sortNotes(old.filter((n) => n.id !== deletedNoteId));
      return old;
    });
    queryClient.removeQueries({ queryKey: queryKeys.notes.editable(deletedNoteId) });
  }

  // Invalidate caches after mutations
  function invalidateNoteCaches(noteId: Note["id"], vehicleId?: string) {
    queryClient.invalidateQueries({ queryKey: queryKeys.notes.editable(noteId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    if (vehicleId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.byVehicle(vehicleId) });
    }
  }

  return {
    syncNoteToCache,
    invalidateNoteCaches,
    syncNewNoteToCache,
    syncDeletedNoteFromCache,
  };
}
