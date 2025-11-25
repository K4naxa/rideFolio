import { api } from "@/lib/api";
import type { RefillSchemaInput } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useRefillQueries() {
  const queryClient = useQueryClient();

  const createRefill = useMutation({
    mutationFn: async (data: RefillSchemaInput) => {
      const response = await api.post("/logs/refill", data);
      return response.data;
    },
    onSuccess(_, variables) {
      queryClient.invalidateQueries({ queryKey: [variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-recent-activity", variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-consumption-chart-data", variables.vehicleId] });
    },
    onError(error) {
      console.error("REFILL CREATION API ERROR: ", error);
      toast.error("Error creating the Refill");
    },
  });

  return {
    createRefill: createRefill.mutate,
    createRefillAsync: createRefill.mutateAsync,
    createPending: createRefill.isPending,
    createError: createRefill.isError,
  };
}
