import { fetchApi } from "@/lib/api";
import { authClient, useAuth } from "@/lib/authClient";
import type { AccessiblePool } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";

export function useAccessiblePools() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["pools"],
    queryFn: async () => fetchApi<AccessiblePool[]>("pools/accessible"),
    staleTime: 1000 * 60 * 30,
    enabled: isAuthenticated,
  });
}
