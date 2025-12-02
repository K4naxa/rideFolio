import { api, fetchApi } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import { handleEmpty } from "@/lib/queries/util";
import type { Todo } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";
import { computed, unref, type MaybeRef } from "vue";

export function useVehicleTodos(vehicleId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: computed(() => queryKeys.todos.byVehicle(handleEmpty(vehicleId))),
    queryFn: async () => {
      return await fetchApi<Todo[]>(`/todos/${unref(vehicleId)}`);
    },
    staleTime: 1000 * 60 * 10,
    enabled: computed(() => !!unref(vehicleId)),
  });
}
