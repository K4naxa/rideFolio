import { api, fetchApi } from "@/lib/api";
import type { TAccessibleVehicle, VehicleSchemaType } from "@repo/validation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useVehicleQueries() {
  const queryClient = useQueryClient();

  // All users accessible vehicles
  const vehicles = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => fetchApi<TAccessibleVehicle[]>("vehicles/accessible"),
    staleTime: 1000 * 60 * 30,
  });

  // Creation of a new vehicle
  const createVehicle = useMutation({
    mutationFn: async (data: VehicleSchemaType) => {
      const response = await api.post("/vehicles", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"], exact: true });
      return data;
    },
  });

  // Deletion of a vehicle
  const deleteVehicle = useMutation({
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

  return {
    vehicles: vehicles.data,
    vehiclesLoading: vehicles.isLoading,
    vehiclesError: vehicles.error,

    createVehicle: createVehicle.mutate,
    createVehicleAsync: createVehicle.mutateAsync,
    createPending: createVehicle.isPending,
    createError: createVehicle.error,

    deleteVehicle: deleteVehicle.mutate,
    deleteVehicleAsync: deleteVehicle.mutateAsync,
    deletePending: deleteVehicle.isPending,
    deleteError: deleteVehicle.error,
  };
}
