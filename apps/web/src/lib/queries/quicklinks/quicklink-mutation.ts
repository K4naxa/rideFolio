import { api } from "@/lib/api";
import type { Quicklink, QuicklinkSchemaType } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useQuicklinkCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: QuicklinkSchemaType) => {
      const response = await api.post("/quicklinks", data);
      return response.data;
    },
    onSuccess: (newLink) => {
      queryClient.setQueryData(["quicklinks"], (old: QuicklinkSchemaType[] | undefined) => {
        if (!old) return undefined;
        return [newLink, ...old];
      });
    },
    onError: (error) => {
      console.error("Quicklink API: Creation Error  ", error);
      toast.error("Error creating the Quicklink");
    },
  });
}

export function useQuicklinkDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/quicklinks/${id}`);
      return;
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(["quicklinks"], (old: Quicklink[] | undefined) => {
        if (!old) return undefined;
        return old.filter((link) => link.id !== id);
      });
    },
    onError: (error) => {
      console.error("Quicklink API: Deletion Error  ", error);
      toast.error("Error deleting the Quicklink");
    },
  });
}
