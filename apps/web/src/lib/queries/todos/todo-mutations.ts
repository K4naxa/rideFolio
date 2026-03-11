import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import { type ActivityItem, type BaseTodo, type TodoSchemaType } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useTodoCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TodoSchemaType) => {
      const response = await api.post<BaseTodo>("/todos", data);
      return response.data;
    },
    onSuccess: (newTodo) => {
      // update vehicle todos cache
      queryClient.setQueryData<BaseTodo[]>(queryKeys.todos.byVehicle(newTodo.vehicleId), (old) => {
        if (!old) return [newTodo];
        return [...old, newTodo];
      });
      // update all todos cache
      queryClient.setQueryData<BaseTodo[]>(queryKeys.todos.all, (old) => {
        if (!old) return [newTodo];
        return [...old, newTodo];
      });

      // update upcoming activity cache if the new todo has a due info
      if (newTodo.dueDate || newTodo.dueOdometer) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.upcomingActivity });
      }
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
      const response = await api.put<BaseTodo>(`/todos/${todoId}`, data);
      return response.data;
    },
    onSuccess: (updatedTodo) => {
      // update vehicle todos cache
      queryClient.setQueryData<BaseTodo[]>(queryKeys.todos.byVehicle(updatedTodo.vehicleId), (old) => {
        if (!old) return old;
        return old.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo));
      });
      // update all todos cache
      queryClient.setQueryData<BaseTodo[]>(queryKeys.todos.all, (old) => {
        if (!old) return old;
        return old.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo));
      });
      // update upcoming activity cache if the updated todo has a due info
      if (updatedTodo.dueDate || updatedTodo.dueOdometer) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.upcomingActivity });
      } else {
        // if the updated todo no longer has due info, remove it from upcoming activity
        queryClient.setQueryData<ActivityItem[]>(queryKeys.user.upcomingActivity, (old) => {
          if (!old) return old;
          return old.filter((activity) => {
            return !(activity.type === "todo" && activity.data.id === updatedTodo.id);
          });
        });
      }
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
      const response = await api.patch<BaseTodo>(`/todos/${todoId}/toggle`, { complete });
      return response.data;
    },
    onSuccess: (data) => {
      // update vehicle todos cache
      queryClient.setQueryData<BaseTodo[]>(queryKeys.todos.byVehicle(data.vehicleId), (old) => {
        if (!old) return old;
        return old.map((todo) => (todo.id === data.id ? data : todo));
      });
      // update all todos cache
      queryClient.setQueryData<BaseTodo[]>(queryKeys.todos.all, (old) => {
        if (!old) return old;
        return old.map((todo) => (todo.id === data.id ? data : todo));
      });

      // update upcoming activity cache if the toggled todo is part of it
      queryClient.invalidateQueries({ queryKey: queryKeys.user.upcomingActivity });

      toast.success(`Todo marked as ${data.isCompleted ? "complete" : "incomplete"}`);
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
    mutationFn: async (variables: { todoId: string; vehicleId: string }) => {
      const response = await api.delete(`/todos/${variables.todoId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.upcomingActivity });
      queryClient.setQueryData<BaseTodo[]>(queryKeys.todos.byVehicle(variables.vehicleId), (old) => {
        if (!old) return old;
        return old.filter((todo) => todo.id !== variables.todoId);
      });
      queryClient.setQueryData<BaseTodo[]>(queryKeys.todos.all, (old) => {
        if (!old) return old;
        return old.filter((todo) => todo.id !== variables.todoId);
      });

      toast.success("Todo deleted successfully");
    },
    onError: (error) => {
      console.error("Todo API: Delete Error  ", error);
      toast.error("Error deleting the Todo item");
    },
  });
}
