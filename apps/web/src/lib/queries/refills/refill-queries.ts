import { fetchApi } from "@/lib/api";
import type { TRefillForClient } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";
import { computed, type MaybeRef, unref } from "vue";

export function useRefillByIdQuery(refillId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: computed(() => ["refills", "id", unref(refillId)]),
    queryFn: async () => await fetchApi<TRefillForClient>(`/logs/refill/${unref(refillId)}`),
    enabled: computed(() => !!unref(refillId)),
    staleTime: 1000 * 60 * 5,
  });
}
