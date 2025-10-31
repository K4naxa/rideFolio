import { fetchApi } from "@/lib/api";
import type { AccessiblePool } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";

export function useAccessiblePools() {
  return useQuery({
    queryKey: ["accessiblePools"],
    queryFn: async () => fetchApi<AccessiblePool[]>("pools/accessible"),
    staleTime: 1000 * 60 * 30,
  });
}
