import { useQuery } from "@tanstack/vue-query";
import { computed, type MaybeRef, unref } from "vue";
import type { Note } from "@repo/validation";
import { fetchApi } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import { handleEmpty } from "@/lib/queries/util";

export const useAllNotes = () => {
  return useQuery({
    queryKey: queryKeys.notes.all,
    queryFn: async () => {
      return fetchApi<Note[]>("/notes");
    },
  });
};

export const useVehicleNotes = (vehicleId: MaybeRef<string | undefined>) => {
  return useQuery({
    queryKey: computed(() => queryKeys.notes.byVehicle(handleEmpty(vehicleId))),
    queryFn: async () => fetchApi<Note[]>(`/notes/vehicle/${unref(vehicleId)}`),
    enabled: computed(() => !!unref(vehicleId)),
  });
};

export const useNoteByIdQuery = (noteId: MaybeRef<string | undefined>) => {
  return useQuery({
    queryKey: computed(() => queryKeys.notes.editable(handleEmpty(noteId))),
    queryFn: async () => await fetchApi<Note>(`/notes/by-id/${unref(noteId)}`),
    enabled: computed(() => !!unref(noteId)),
  });
};
