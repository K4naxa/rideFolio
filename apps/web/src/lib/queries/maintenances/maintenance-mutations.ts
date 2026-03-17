import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import type { MaintenanceInput } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useMaintenanceCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MaintenanceInput) => {
      return await api.post("/logs/maintenance", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.heroStatCards(variables.vehicleId) });
    },
    onError: (error) => {
      console.error("MAINTENANCE CREATION API ERROR: ", error);
    },
  });
}

export function useMaintenanceDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { maintenanceId: string; vehicleId: string }) => {
      const response = await api.delete(`/logs/maintenance/${variables.maintenanceId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.heroStatCards(variables.vehicleId) });
      toast.success("Maintenance deleted successfully");
    },
    onError: (error) => {
      console.error("Maintenance API: Delete Error ", error);
      toast.error("Error deleting the maintenance");
    },
  });
}
