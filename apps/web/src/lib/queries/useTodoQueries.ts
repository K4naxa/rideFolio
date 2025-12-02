import { api, fetchApi } from "@/lib/api";
import type { Todo, TodoSchemaType } from "@repo/validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, unref, type MaybeRef } from "vue";
import { toast } from "vue-sonner";

export function useTodoQueries(vehicleId?: MaybeRef<string | undefined>) {
  const queryClient = useQueryClient();

  // Fetch all todos (all vehicles)
  const allTodosQuery = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const response = await api.get<Todo[]>("/todos");
      return response.data;
    },
    enabled: false,
  });

  // Fetch vehicle-specific todos
  const vehicleTodosQuery = useQuery({
    queryKey: computed(() => ["todos", { vehicleId: unref(vehicleId) }]),
    queryFn: async () => {
      const id = unref(vehicleId);
      if (!id) throw new Error("Vehicle ID is required");
      return await fetchApi<Todo[]>(`/todos/${id}`);
    },
    staleTime: 1000 * 60 * 10,
    enabled: computed(() => !!unref(vehicleId)),
  });

  // Create todo
  const createTodoMutation = useMutation({
    mutationFn: async (data: TodoSchemaType) => {
      const response = await api.post("/todos", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["todos"], exact: true });
      queryClient.invalidateQueries({
        queryKey: ["todos", { vehicleId: variables.vehicleId }],
        exact: true,
      });
    },
    onError: (error) => {
      console.error("TODO CREATION API ERROR: ", error);
      toast.error("Error creating the Todo item");
    },
  });

  // Update todo
  const updateTodoMutation = useMutation({
    mutationFn: async ({ todoId, vehicleId, data }: { todoId: string; vehicleId: string; data: TodoSchemaType }) => {
      const response = await api.put(`/todos/${todoId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["todos"], exact: true });
      queryClient.invalidateQueries({
        queryKey: ["todos", { vehicleId: variables.vehicleId }],
        exact: true,
      });
    },
    onError: (error) => {
      console.error("TODO UPDATE API ERROR: ", error);
      toast.error("Error updating the Todo item");
    },
  });

  // Toggle todo completion
  const toggleTodoMutation = useMutation({
    mutationFn: async ({ todoId, vehicleId, complete }: { todoId: string; vehicleId: string; complete: boolean }) => {
      const response = await api.patch(`/todos/${todoId}/toggle`, { complete });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["todos"], exact: true });
      queryClient.invalidateQueries({
        queryKey: ["todos", { vehicleId: variables.vehicleId }],
        exact: true,
      });
    },
    onError: (error) => {
      console.error("TODO TOGGLE API ERROR: ", error);
      toast.error("Error toggling the Todo item");
    },
  });

  // Delete todo
  const deleteTodoMutation = useMutation({
    mutationFn: async ({ todoId, vehicleId }: { todoId: string; vehicleId: string }) => {
      const response = await api.delete(`/todos/${todoId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["todos"], exact: true });
      queryClient.invalidateQueries({
        queryKey: ["todos", { vehicleId: variables.vehicleId }],
        exact: true,
      });
    },
    onError: (error) => {
      console.error("TODO DELETION API ERROR: ", error);
      toast.error("Error deleting the Todo item");
    },
  });

  return {
    // All Todos Query
    allTodos: allTodosQuery.data,
    allTodosLoading: allTodosQuery.isLoading,
    allTodosError: allTodosQuery.error,
    refetchAllTodos: allTodosQuery.refetch,

    // Vehicle Todos Query
    vehicleTodos: vehicleTodosQuery.data,
    vehicleTodosLoading: vehicleTodosQuery.isLoading,
    vehicleTodosError: vehicleTodosQuery.error,
    refetchVehicleTodos: vehicleTodosQuery.refetch,

    // Create Mutation
    createTodo: createTodoMutation.mutate,
    createTodoAsync: createTodoMutation.mutateAsync,
    isCreating: createTodoMutation.isPending,
    createError: createTodoMutation.error,

    // Update Mutation
    updateTodo: updateTodoMutation.mutate,
    updateTodoAsync: updateTodoMutation.mutateAsync,
    isUpdating: updateTodoMutation.isPending,
    updateError: updateTodoMutation.error,

    // Toggle Mutation
    toggleTodo: toggleTodoMutation.mutate,
    toggleTodoAsync: toggleTodoMutation.mutateAsync,
    isToggling: toggleTodoMutation.isPending,

    // Delete Mutation
    deleteTodo: deleteTodoMutation.mutate,
    deleteTodoAsync: deleteTodoMutation.mutateAsync,
    isDeleting: deleteTodoMutation.isPending,
    deleteError: deleteTodoMutation.error,
  };
}
