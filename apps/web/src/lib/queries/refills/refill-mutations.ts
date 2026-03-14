import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import type { RefillSchemaInput, TAccessibleVehicle } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

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
        return old.map((vehicle) => {
          if (vehicle.vehicleData.id !== variables.vehicleId) return vehicle;

          const newOdometer = variables.odometer as number | null;
          const currentOdometer = vehicle.vehicleData.odometerData?.value;
          const isLatestRefill = newOdometer != null && (currentOdometer == null || newOdometer > currentOdometer);

          if (!isLatestRefill) return vehicle;

          return {
            ...vehicle,
            vehicleData: {
              ...vehicle.vehicleData,
              odometerData: {
                ...vehicle.vehicleData.odometerData,
                value: newOdometer,
                lastRefillValue: newOdometer,
              },
            },
          };
        });
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.consumptionCharts(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.heroStatCards(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all });
    },
  });
}
