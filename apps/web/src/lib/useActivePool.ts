import { useRoute } from "vue-router";
import { computed } from "vue";
import { usePoolsAll } from "@/lib/queries/pools/pool-queries";

export function useActivePool() {
  const route = useRoute();

  // Get active vehicle ID from URL params
  const activePoolId = computed(() => {
    return route.params.poolId as string | undefined;
  });

  // Check if there's an active vehicle
  const hasActivePool = computed(() => !!activePoolId.value);

  // Get the full vehicle data from the accessible vehicles list
  const { data: pools } = usePoolsAll();

  const activePool = computed(() => {
    if (!activePoolId.value || !pools.value) return null;
    return pools.value.find((p) => p.id === activePoolId.value);
  });

  const activePoolName = computed(() => activePool.value?.name);

  return {
    activePoolId,
    hasActivePool,
    activePool,
    activePoolName,
  };
}
