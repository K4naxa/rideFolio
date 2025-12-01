import { api, fetchApi } from "@/lib/api";
import { type MaintenanceType, type TMaintenanceCategory, type TMaintenanceSchema } from "@repo/validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, unref, type MaybeRef } from "vue";
import { toast } from "vue-sonner";

export function useMaintenanceQueries(typeCode?: MaybeRef<string | undefined>) {
  const queryClient = useQueryClient();

  const partCategories = useQuery({
    queryKey: computed(() => ["maintenance", "part-categories", unref(typeCode)]),
    queryFn: async () => {
      return await fetchApi<TMaintenanceCategory[]>(`/logs/maintenance/categories/${unref(typeCode)}`);
    },
    enabled: computed(() => !!unref(typeCode)),
  });

  const maintenanceTypes = useQuery({
    queryKey: ["maintenance", "types"],
    queryFn: async () => {
      return await fetchApi<MaintenanceType[]>(`/logs/maintenance/types`);
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

    maintenanceTypes: maintenanceTypes.data,
    maintenanceTypesLoading: maintenanceTypes.isLoading,
  };
}
