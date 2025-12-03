import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import type { VehicleSchemaType } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useVehicleCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: VehicleSchemaType) => {
      const response = await api.post("/vehicles", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
    onError: (error) => {
      toast.error("Error creating the Vehicle");
      console.error("Create vehicle error:", error);
    },
  });
}

export function useVehicleDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicleId: string) => {
      const response = await api.delete(`/vehicles/${vehicleId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Vehicle deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["vehicles"], exact: true });
    },
    onError: (error) => {
      toast.error("Failed to delete vehicle");
      console.error("Delete vehicle error:", error);
    },
  });
}
