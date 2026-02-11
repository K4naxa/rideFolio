import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import { type Todo, type TodoSchemaType } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useTodoCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TodoSchemaType) => {
      const response = await api.post<Todo>("/todos", data);
      return response.data;
    },
    onSuccess: (newTodo) => {
      // update vehicle todos cache
      queryClient.setQueryData<Todo[]>(queryKeys.todos.byVehicle(newTodo.vehicleData.id), (old) => {
        if (!old) return [newTodo];
        return [...old, newTodo];
      });
      // update all todos cache
      queryClient.setQueryData<Todo[]>(queryKeys.todos.all, (old) => {
        if (!old) return [newTodo];
        return [...old, newTodo];
      });
    },
    onError: (error) => {
      console.error("Todo API: Creation Error  ", error);
      toast.error("Error creating the Todo item");
    },
  });
}

export function useTodoUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ todoId, data }: { todoId: string; data: TodoSchemaType }) => {
      const response = await api.put<Todo>(`/todos/${todoId}`, data);
      return response.data;
    },
    onSuccess: (updatedTodo) => {
      // update vehicle todos cache
      queryClient.setQueryData<Todo[]>(queryKeys.todos.byVehicle(updatedTodo.vehicleData.id), (old) => {
        if (!old) return old;
        return old.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo));
      });
      // update all todos cache
      queryClient.setQueryData<Todo[]>(queryKeys.todos.all, (old) => {
        if (!old) return old;
        return old.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo));
      });
    },
    onError: (error) => {
      console.error("Todo API: Update Error  ", error);
      toast.error("Error updating the Todo item");
    },
  });
}

export function useTodoToggle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ todoId, complete }: { todoId: string; complete: boolean }) => {
      const response = await api.patch<Todo>(`/todos/${todoId}/toggle`, { complete });
      return response.data;
    },
    onSuccess: (data) => {
      // update vehicle todos cache
      queryClient.setQueryData<Todo[]>(queryKeys.todos.byVehicle(data.vehicleData.id), (old) => {
        if (!old) return old;
        return old.map((todo) => (todo.id === data.id ? data : todo));
      });
      // update all todos cache
      queryClient.setQueryData<Todo[]>(queryKeys.todos.all, (old) => {
        if (!old) return old;
        return old.map((todo) => (todo.id === data.id ? data : todo));
      });
    },
    onError: (error) => {
      console.error("Todo API: Toggle Error  ", error);
      toast.error("Error toggling the Todo item");
    },
  });
}

export function useTodoDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ todoId, vehicleId }: { todoId: string; vehicleId: string }) => {
      const response = await api.delete(`/todos/${todoId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Todo[]>(queryKeys.todos.byVehicle(variables.vehicleId), (old) => {
        if (!old) return old;
        return old.filter((todo) => todo.id !== variables.todoId);
      });
      queryClient.setQueryData<Todo[]>(queryKeys.todos.all, (old) => {
        if (!old) return old;
        return old.filter((todo) => todo.id !== variables.todoId);
      });
    },
    onError: (error) => {
      console.error("Todo API: Delete Error  ", error);
      toast.error("Error deleting the Todo item");
    },
  });
}
