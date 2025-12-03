import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import type { RefillSchemaInput, TAccessibleVehicle } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useRefillCreate() {
  const queryClient = useQueryClient();
  return useMutation({
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

      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.consumptionCharts(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.heroStatCards(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all });
    },
    onError(error) {
      console.error("Refill API: Creation error ", error);
      toast.error("Error creating the Refill");
    },
  });
}
