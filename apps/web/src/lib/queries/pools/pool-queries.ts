import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authClient";
import { queryKeys } from "@/lib/queries/queryKeys";
import { handleEmpty } from "@/lib/queries/util";
import type { AccessiblePool, PoolDetails } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";
import { computed, unref, watchEffect, type MaybeRef } from "vue";

export function usePoolsAll() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.pools.all,
    queryFn: async () => fetchApi<AccessiblePool[]>("pools/accessible"),
    staleTime: 1000 * 60 * 30,
    enabled: isAuthenticated,
  });
}

export function usePoolDetails(poolId: MaybeRef<string | undefined>) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: computed(() => queryKeys.pools.detail(handleEmpty(poolId))),
    queryFn: async () => await fetchApi<PoolDetails>(`pools/${unref(poolId)}`),
    enabled: computed(() => isAuthenticated.value && !!unref(poolId)),
  });
}
