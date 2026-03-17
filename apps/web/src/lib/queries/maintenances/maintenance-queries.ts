import { fetchApi } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import { handleEmpty } from "@/lib/queries/util";
import type { ClientMaintenance, MaintenanceCategoryWithParts } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";
import { computed, type MaybeRef, unref } from "vue";

export function useMaintenanceByIdQuery(maintenanceId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: computed(() => ["maintenances", "id", unref(maintenanceId)]),
    queryFn: async () => await fetchApi<ClientMaintenance>(`/logs/maintenance/${unref(maintenanceId)}`),
    enabled: computed(() => !!unref(maintenanceId)),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMaintenancePartCategories(typeCode: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: computed(() => queryKeys.maintenances.partCategories(handleEmpty(typeCode))),
    queryFn: async () => {
      return await fetchApi<MaintenanceCategoryWithParts[]>(`/logs/maintenance/categories/${unref(typeCode)}`);
    },
    enabled: computed(() => !!unref(typeCode)),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
