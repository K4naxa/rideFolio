import { api } from "@/lib/api";
import {
  type TMaintenanceCategory,
  type TBasicVehicle,
  type TVehicleTypeCode,
  type TMaintenanceSchema,
  VehicleTypeCodes,
} from "@repo/validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { unref, type MaybeRef } from "vue";

export function useMaintenanceQueries({
  vehicleId,
  typeCode,
}: {
  vehicleId?: MaybeRef<TBasicVehicle["id"] | undefined>;
  typeCode?: MaybeRef<TVehicleTypeCode | undefined>;
}) {
  const queryClient = useQueryClient();

  // FETCHES
  const partCategories = useQuery({
    queryKey: ["maintenance", "part-categories", typeCode],
    queryFn: async () => {
      if (!typeCode || !unref(typeCode)) {
        throw new Error("Vehicle type code is required to fetch maintenance categories");
      }
      const response = await api.get<TMaintenanceCategory[]>(
        `/logs/maintenance/categories/${unref(typeCode)}`,
      );
      return response.data;
    },
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: TMaintenanceSchema) => {
      return await api.post("/logs/maintenance", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [] });
    },
  });

  return {
    createMaintenance: createMaintenanceMutation.mutate,
    createMaintenanceAsync: createMaintenanceMutation.mutateAsync,
    isCreating: createMaintenanceMutation.isPending,
    creationError: createMaintenanceMutation.isError,

    partCategories: partCategories.data,
    partCategoriesLoading: partCategories.isLoading,
  };
}
