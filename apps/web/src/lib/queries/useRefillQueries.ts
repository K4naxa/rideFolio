import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import type { RefillSchemaInput, TAccessibleVehicle } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useRefillQueries() {
  const queryClient = useQueryClient();

  const createRefill = useMutation({
    mutationKey: ["create-refill"],
    mutationFn: async (data: RefillSchemaInput) => {
      const response = await api.post("/logs/refill", data);
      return response.data;
    },
    onSuccess(_, variables) {
      queryClient.setQueryData<TAccessibleVehicle[]>(queryKeys.vehicles.all, (old) => {
        if (!old) return old;
        return old.map((vehicle) =>
          vehicle.vehicleData.id === variables.vehicleId
            ? {
                ...vehicle,
                vehicleData: {
                  ...vehicle.vehicleData,
                  odometerData: {
                    ...vehicle.vehicleData.odometerData,
                    value: variables.odometer as number | null,
                    lastRefillValue: variables.odometer as number | null,
                  },
                },
              }
            : vehicle,
        );
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.refills(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.consumptionCharts(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all });
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
