import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authClient";
import { addNetworkDelay } from "@/lib/utils";
import { useQuery } from "@tanstack/vue-query";
import type { Quicklink } from "node_modules/@repo/validation/dist/types/quicklink/quicklink.types";
import { computed } from "vue";

export function useQuicklinks() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["quicklinks"],
    queryFn: async (): Promise<Quicklink[]> => {
      await addNetworkDelay(1000);
      return await fetchApi<Quicklink[]>("quicklinks");
    },
    staleTime: 1000 * 60 * 5,
    enabled: computed(() => isAuthenticated.value),
  });
}
