import { api, fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authClient";
import { queryKeys } from "@/lib/queries/queryKeys";
import { handleEmpty } from "@/lib/queries/util";
import type { TAccessibleVehicle, TRefillForClient, TStatCardData, VehicleType } from "@repo/validation";
import { useInfiniteQuery, useQuery } from "@tanstack/vue-query";
import { computed, unref, type MaybeRef } from "vue";

export function useVehicleHeroStatCards(vehicleId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: computed(() => queryKeys.vehicles.heroStatCards(handleEmpty(vehicleId))),
    queryFn: async () => {
      const result = await fetchApi<TStatCardData>(`/vehicles/${unref(vehicleId)}/stat-card`);
      return result;
    },
    enabled: computed(() => !!unref(vehicleId)),
  });
}

export function useVehicleTimelineInfinite(vehicleId: MaybeRef<string | undefined>, LIMIT = 10) {
  return useInfiniteQuery({
    queryKey: computed(() => queryKeys.timelines.byVehicle(handleEmpty(vehicleId))),
    queryFn: async ({ pageParam }: { pageParam: string }) => {
      const cursor = pageParam;
      const response = await api.get(`/vehicles/${unref(vehicleId)}/infiniteActivities/${cursor}/${LIMIT}`);
      return response.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: "initial",
    enabled: computed(() => !!unref(vehicleId)),
  });
}

export function useVehiclesAll() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => fetchApi<TAccessibleVehicle[]>("vehicles/accessible"),
    staleTime: 1000 * 60 * 30,
    enabled: isAuthenticated,
  });
}

export function useVehicleTypes(options?: { enabled?: MaybeRef<boolean> }) {
  return useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: async () => fetchApi<VehicleType[]>("vehicles/types"),
    staleTime: 1000 * 60 * 60,
    enabled: options?.enabled ?? true,
    refetchOnMount: true,
  });
}

export function useVehicleConsumptionChart(vehicleId: MaybeRef<string | undefined>, timeRange: MaybeRef<number>) {
  return useQuery({
    queryKey: computed(() => queryKeys.vehicles.consumptionChart(handleEmpty(vehicleId), unref(timeRange))),
    queryFn: async () => {
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - unref(timeRange));

      return await fetchApi<TRefillForClient[]>(`/logs/refills/chart/${unref(vehicleId)}/${limitDate.toISOString()}`);
    },
    enabled: computed(() => !!unref(vehicleId) && !!unref(timeRange)),
    placeholderData: (prev) => prev,
  });
}
