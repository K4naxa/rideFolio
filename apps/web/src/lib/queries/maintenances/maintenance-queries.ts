import { fetchApi } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import { handleEmpty } from "@/lib/queries/util";
import type { MaintenanceType, TMaintenanceCategory } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";
import { computed, unref, type MaybeRef } from "vue";

export function useMaintenancePartCategories(typeCode: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: computed(() => queryKeys.maintenances.partCategories(handleEmpty(typeCode))),
    queryFn: async () => {
      return await fetchApi<TMaintenanceCategory[]>(`/logs/maintenance/categories/${unref(typeCode)}`);
    },
    enabled: computed(() => !!unref(typeCode)),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useMaintenanceTypes(options?: { enabled?: MaybeRef<boolean> }) {
  return useQuery({
    queryKey: queryKeys.maintenances.types(),
    queryFn: async () => {
      return await fetchApi<MaintenanceType[]>(`/logs/maintenance/types`);
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
