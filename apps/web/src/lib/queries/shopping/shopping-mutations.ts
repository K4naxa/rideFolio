import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import type { ShoppingItem, ShoppingItemValues } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

function sortItems(items: ShoppingItem[]): ShoppingItem[] {
  return [...items].sort((a, b) => {
    //   sort by created At, oldest first
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export function useShoppingCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["shopping-create-item"],
    mutationFn: async (data: ShoppingItemValues) => {
      const response = await api.post("/shopping-list", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ShoppingItem[]>(queryKeys.shoppingList.all, (old) => {
        if (!old) return [data];
        return sortItems([...old, data]);
      });
      queryClient.setQueryData<ShoppingItem[]>(queryKeys.shoppingList.byVehicle(data.vehicleId), (old) => {
        if (!old) return [data];
        return sortItems([...old, data]);
      });
    },
    onError: (error) => {
      toast.error("Error creating the Shopping List item");
      console.error("SHOPPING LIST CREATION API ERROR: ", error);
    },
  });
}

export function useShoppingToggle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["shopping-toggle-item"],
    mutationFn: async ({ itemId, purchased }: { itemId: string; purchased: boolean }) => {
      const response = await api.patch(`/shopping-list/${itemId}/toggle`, {
        isPurchased: purchased,
      });
      return response.data;
    },
    onSuccess: (data: ShoppingItem) => {
      queryClient.setQueryData<ShoppingItem[]>(queryKeys.shoppingList.all, (old) => {
        if (!old) return old;
        const updatedItems = old.map((item) => (item.id === data.id ? data : item));
        return sortItems(updatedItems);
      });
      queryClient.setQueryData<ShoppingItem[]>(queryKeys.shoppingList.byVehicle(data.vehicleId), (old) => {
        if (!old) return old;
        const updatedItems = old.map((item) => (item.id === data.id ? data : item));
        return sortItems(updatedItems);
      });
    },
    onError: (error) => {
      toast.error("Error toggling the Shopping List item");
      console.error("SHOPPING LIST TOGGLE API ERROR: ", error);
    },
  });
}

export function useShoppingDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["shopping-delete-item"],
    mutationFn: async ({ itemId, vehicleId }: { itemId: string; vehicleId: string }) => {
      const response = await api.delete(`/shopping-list/${itemId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<ShoppingItem[]>(queryKeys.shoppingList.all, (old) => {
        if (!old) return old;
        return old.filter((item) => item.id !== variables.itemId);
      });
      queryClient.setQueryData<ShoppingItem[]>(queryKeys.shoppingList.byVehicle(variables.vehicleId), (old) => {
        if (!old) return old;
        return old.filter((item) => item.id !== variables.itemId);
      });
    },
    onError: (error) => {
      toast.error("Error deleting the Shopping List item");
      console.error("SHOPPING LIST DELETION API ERROR: ", error);
    },
  });
}
