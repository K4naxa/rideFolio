import { useQueryClient } from "@tanstack/vue-query";
import type { EditableNote, Note, NoteSchemaType } from "@repo/validation";

export function useNoteCacheSync() {
  const queryClient = useQueryClient();

  // Update cache after successful save (not on every keystroke)
  function syncNoteToCache(noteId: Note["id"], noteData: EditableNote) {
    // update specific editable note
    queryClient.setQueryData<NoteSchemaType>(["notes", "editable", noteId], (old) => {
      if (!old) return old;
      return { ...old, ...noteData };
    });

    // Update global notes cache
    queryClient.setQueryData<Note[]>(["notes"], (old) => {
      if (!old) return old;
      return old.map((n) =>
        n.id === noteId
          ? {
              ...n,
              title: noteData.title ?? n.title,
              content: noteData.content ?? n.content,
              pinned: noteData.pinned ?? n.pinned,
              tags: noteData.tags ?? n.tags,
              updatedAt: noteData.updatedAt ?? new Date(),
            }
          : n,
      );
    });

    // Update vehicle-specific cache if vehicleId exists
    if (noteData.vehicleId) {
      queryClient.setQueryData<Note[]>(["notes", "vehicle", noteData.vehicleId], (old) => {
        if (!old) return old;
        return old.map((n) =>
          n.id === noteId
            ? {
                ...n,
                title: noteData.title ?? n.title,
                content: noteData.content ?? n.content,
                pinned: noteData.pinned ?? n.pinned,
                tags: noteData.tags ?? n.tags,
                updatedAt: noteData.updatedAt ?? new Date(),
              }
            : n,
        );
      });
    }
  }

  function syncNewNoteToCache(newNote: Note) {
    // Add to global notes cache
    queryClient.setQueryData<Note[]>(["notes"], (old) => {
      if (!old) return old;
      return [newNote, ...old];
    });
    // Add to vehicle-specific cache
    queryClient.setQueryData<Note[]>(["notes", "vehicle", newNote.vehicle.id], (old) => {
      if (!old) return old;
      return [newNote, ...old];
    });

    queryClient.setQueryData<NoteSchemaType>(["notes", "editable", newNote.id], () => ({
      vehicleId: newNote.vehicle.id,
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags,
      pinned: newNote.pinned,
      updatedAt: newNote.updatedAt,
    }));

    // Set the query as fresh for 3 seconds to prevent immediate refetch
    queryClient.setQueryDefaults(["notes", "editable", newNote.id], {
      staleTime: 3000,
    });
  }

  function syncDeletedNoteFromCache(deletedNoteId: Note["id"]) {
    queryClient.setQueriesData({ queryKey: ["notes"] }, (old: Note[] | undefined) => {
      if (!old) return old;
      if (Array.isArray(old)) return old.filter((n) => n.id !== deletedNoteId);
      return old;
    });
    queryClient.removeQueries({ queryKey: ["notes", "editable", deletedNoteId] });
  }

  // Invalidate caches after mutations
  function invalidateNoteCaches(noteId: Note["id"], vehicleId?: string) {
    queryClient.invalidateQueries({ queryKey: ["notes", "editable", noteId] });
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    if (vehicleId) {
      queryClient.invalidateQueries({ queryKey: ["notes", "vehicle", vehicleId] });
    }
  }

  return {
    syncNoteToCache,
    invalidateNoteCaches,
    syncNewNoteToCache,
    syncDeletedNoteFromCache,
  };
}
