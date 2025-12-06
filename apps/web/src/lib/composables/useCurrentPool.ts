import { useRoute } from "vue-router";
import { computed } from "vue";
import { usePoolsAll } from "@/lib/queries/pools/pool-queries";

export function useCurrentPool() {
  const route = useRoute();

  // Get active vehicle ID from URL params
  const currentPoolId = computed(() => {
    return route.params.poolId as string | undefined;
  });

  // Check if there's an active vehicle
  const hasCurrentPool = computed(() => !!currentPoolId.value);

  // Get the full vehicle data from the accessible vehicles list
  const { data: pools } = usePoolsAll();

  const currentPool = computed(() => {
    if (!currentPoolId.value || !pools.value) return null;
    return pools.value.find((p) => p.id === currentPoolId.value);
  });

  const currentPoolName = computed(() => currentPool.value?.name);

  return {
    currentPoolId,
    hasCurrentPool,

    currentPool,
    currentPoolName,
  };
}
