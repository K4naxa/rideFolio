import { api, fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authClient";
import { queryKeys } from "@/lib/queries/queryKeys";
import { handleEmpty } from "@/lib/queries/util";
import type { BaseTodo, TodoWithVehicle } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";
import { computed, unref, type MaybeRef } from "vue";

export function useVehicleTodos(vehicleId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: computed(() => queryKeys.todos.byVehicle(handleEmpty(vehicleId))),
    queryFn: async () => await fetchApi<BaseTodo[]>(`/todos/vehicle/${unref(vehicleId)}`),

    staleTime: 1000 * 60 * 10,
    enabled: computed(() => !!unref(vehicleId)),
  });
}

export function useTodosAll() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.todos.all,
    queryFn: async () => await fetchApi<TodoWithVehicle[]>(`/todos/with-vehicles`),
    staleTime: 1000 * 60 * 10,
    enabled: computed(() => isAuthenticated.value),
  });
}

export function useTodoById(todoId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: computed(() => queryKeys.todos.byId(handleEmpty(todoId))),
    queryFn: async () => await fetchApi<BaseTodo>(`/todos/${unref(todoId)}`),
    enabled: computed(() => !!unref(todoId)),
  });
}
