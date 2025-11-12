// composables/useNoteQueries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { unref, computed } from "vue";
import type { Note, NoteSchemaType } from "@repo/validation";
import { api } from "@/lib/api";

export function useNoteQueries(vehicleId?: MaybeRef<string | undefined>) {
  const queryClient = useQueryClient();

  // Fetch all accessible notes
  const allNotesQuery = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const response = await api.get<Note[]>("/notes");
      return response.data;
    },
    enabled: false,
  });

  // Fetch vehicle-specific notes
  const vehicleNotesQuery = useQuery({
    queryKey: computed(() => ["notes", "vehicle", unref(vehicleId)]),
    queryFn: async () => {
      const id = unref(vehicleId);
      if (!id) throw new Error("Vehicle ID is required");
      const response = await api.get<Note[]>(`/notes/vehicle/${id}`);
      return response.data;
    },
    enabled: computed(() => !!unref(vehicleId)),
  });

  // Fetch single note by ID
  const getEditableNote = (noteId: MaybeRef<string | undefined>) => {
    return useQuery({
      queryKey: computed(() => ["notes", unref(noteId)]),
      queryFn: async () => {
        const id = unref(noteId);
        if (!id || id === "new") return undefined;
        const response = await api.get<NoteSchemaType>(`/notes/${id}/editable`);
        return response.data;
      },
      enabled: computed(() => {
        const id = unref(noteId);
        return !!id && id !== "new";
      }),
    });
  };

  // Create note
  const createNoteMutation = useMutation({
    mutationFn: async (data: NoteSchemaType) => {
      const response = await api.post<{ success: boolean | null; id: string }>("/notes", data);
      console.log("Created note response:", response.data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate all notes list
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      // Invalidate specific vehicle notes if vehicleId exists in the data
      if (variables.vehicleId) {
        queryClient.invalidateQueries({
          queryKey: ["notes", "vehicle", variables.vehicleId],
        });
      }
    },
  });

  const togglePinNoteMutation = useMutation({
    mutationFn: async ({
      noteId,
      pinned,
      vehicleId,
    }: {
      noteId: string;
      pinned: boolean;
      vehicleId: string;
    }) => {
      const response = await api.patch<{ success: boolean | null }>(`/notes/${noteId}/pin`, {
        pinned,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      if (variables.vehicleId) {
        queryClient.invalidateQueries({
          queryKey: ["notes", "vehicle", variables.vehicleId],
        });
      }
    },
  });

  // Update note
  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, data }: { noteId: string; data: NoteSchemaType }) => {
      const response = await api.patch<{ success: boolean | null }>(`/notes/${noteId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      // Invalidate the specific note
      queryClient.invalidateQueries({
        queryKey: ["notes", variables.noteId],
      });
      // Invalidate vehicle notes if vehicleId exists
      if (variables.data.vehicleId) {
        queryClient.invalidateQueries({
          queryKey: ["notes", "vehicle", variables.data.vehicleId],
        });
      }
    },
  });

  // Delete note
  const deleteNoteMutation = useMutation({
    mutationFn: async ({ noteId, vehicleId }: { noteId: string; vehicleId: string }) => {
      const response = await api.delete<{ success: boolean | null }>(`/notes/${noteId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      if (variables.vehicleId) {
        queryClient.invalidateQueries({
          queryKey: ["notes", "vehicle", variables.vehicleId],
        });
      }
    },
  });

  return {
    // All Notes Query
    allNotes: allNotesQuery.data,
    allNotesLoading: allNotesQuery.isLoading,
    allNotesError: allNotesQuery.error,
    refetchAllNotes: allNotesQuery.refetch,

    // Vehicle Notes Query
    vehicleNotes: vehicleNotesQuery.data,
    vehicleNotesLoading: vehicleNotesQuery.isLoading,
    vehicleNotesError: vehicleNotesQuery.error,
    refetchVehicleNotes: vehicleNotesQuery.refetch,

    // Toggle pin
    togglePin: togglePinNoteMutation.mutate,
    togglePinAsync: togglePinNoteMutation.mutateAsync,
    isTogglingPin: togglePinNoteMutation.isPending,
    togglePinError: togglePinNoteMutation.error,

    // Get Note By ID (function that returns a query)
    getEditableNote: getEditableNote,

    // Create Mutation
    createNote: createNoteMutation.mutate,
    createNoteAsync: createNoteMutation.mutateAsync,
    isCreating: createNoteMutation.isPending,
    createError: createNoteMutation.error,

    // Update Mutation
    updateNote: updateNoteMutation.mutate,
    updateNoteAsync: updateNoteMutation.mutateAsync,
    isUpdating: updateNoteMutation.isPending,
    updateError: updateNoteMutation.error,

    // Delete Mutation
    deleteNote: deleteNoteMutation.mutate,
    deleteNoteAsync: deleteNoteMutation.mutateAsync,
    isDeleting: deleteNoteMutation.isPending,
    deleteError: deleteNoteMutation.error,
  };
}
