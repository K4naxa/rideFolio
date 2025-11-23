import { api, fetchApi } from "@/lib/api";
import {
  type TMaintenanceCategory,
  type TBasicVehicle,
  type TVehicleTypeCode,
  type TMaintenanceSchema,
} from "@repo/validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { unref, type MaybeRef } from "vue";
import { toast } from "vue-sonner";

export function useMaintenanceQueries(typeCode?: MaybeRef<TVehicleTypeCode | undefined>) {
  const queryClient = useQueryClient();

  const partCategories = useQuery({
    queryKey: ["maintenance", "part-categories", typeCode],
    queryFn: async () => {
      if (!typeCode || !unref(typeCode)) {
        throw new Error("Vehicle type code is required to fetch maintenance categories");
      }
      return await fetchApi<TMaintenanceCategory[]>(`/logs/maintenance/categories/${unref(typeCode)}`);
    },
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: TMaintenanceSchema) => {
      return await api.post("/logs/maintenance", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [] });
    },
    onError: (error) => {
      console.error("MAINTENANCE CREATION API ERROR: ", error);
      toast.error("Error creating the Maintenance log");
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
