import { api, fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authClient";
import { queryKeys } from "@/lib/queries/queryKeys";
import { handleEmpty } from "@/lib/queries/util";
import { type BasicVehicle, type TAccessibleVehicle, type TRefillForClient, type VehicleType } from "@repo/validation";
import { useInfiniteQuery, useQuery } from "@tanstack/vue-query";
import { computed, unref, type MaybeRef } from "vue";

export function useVehiclesAll() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => await fetchApi<TAccessibleVehicle[]>("vehicles/accessible"),
    staleTime: 1000 * 60 * 30,
    enabled: isAuthenticated,
  });
}

export function useVehicleByIdQuery(vehicleId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: computed(() => queryKeys.vehicles.byId(handleEmpty(vehicleId))),
    queryFn: async () => await fetchApi<BasicVehicle>(`vehicles/by-id/${unref(vehicleId)}`),
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

export function useVehicleTypes(options?: { enabled?: MaybeRef<boolean> }) {
  return useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: async () => await fetchApi<VehicleType[]>("vehicles/types"),
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
