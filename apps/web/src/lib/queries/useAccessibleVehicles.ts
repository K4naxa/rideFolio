import { fetchApi } from "@/lib/api";
import type { TAccessibleVehicle } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";

export function useAccessibleVehicles() {
  return useQuery({
    queryKey: ["accessibleVehicles"],
    queryFn: async () => fetchApi<TAccessibleVehicle[]>("vehicles/accessible"),
    staleTime: 1000 * 60 * 30,
  });
}
