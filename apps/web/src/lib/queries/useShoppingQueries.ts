import { api, fetchApi } from "@/lib/api";
import type { ShoppingListItem, ShoppingListItemSchemaType } from "@repo/validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, unref, type MaybeRef } from "vue";
import { toast } from "vue-sonner";

export function useShoppingQueries(vehicleId?: MaybeRef<string | undefined>) {
  const queryClient = useQueryClient();

  // Fetch all todos (all vehicles)
  const allShoppingQuery = useQuery({
    queryKey: ["shopping-list"],
    queryFn: async () => {
      return await fetchApi<ShoppingListItem[]>(`/shopping-list`);
    },
    enabled: false,
  });

  // Fetch vehicle-specific shopping list
  const vehicleShoppingListQuery = useQuery({
    queryKey: computed(() => ["shopping-list", "vehicle", unref(vehicleId)]),
    queryFn: async () => {
      const id = unref(vehicleId);
      if (!id) throw new Error("Vehicle ID is required");
      return await fetchApi<ShoppingListItem[]>(`/shopping-list/${id}`);
    },
    staleTime: 1000 * 60 * 10,
    enabled: computed(() => !!unref(vehicleId)),
  });

  // Create shopping list item
  const createItemMutation = useMutation({
    mutationFn: async (data: ShoppingListItemSchemaType) => {
      const response = await api.post("/shopping-list", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"], exact: true });
      queryClient.invalidateQueries({
        queryKey: ["shopping-list", "vehicle", variables.vehicleId],
        exact: true,
      });
    },
    onError: (error) => {
      toast.error("Error creating the Shopping List item");
      console.error("SHOPPING LIST CREATION API ERROR: ", error);
    },
  });

  // Update shopping list item
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, vehicleId, data }: { itemId: string; vehicleId: string; data: ShoppingListItem }) => {
      const response = await api.put(`/shopping-list/${itemId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"], exact: true });
      queryClient.invalidateQueries({
        queryKey: ["shopping-list", "vehicle", variables.vehicleId],
        exact: true,
      });
    },
    onError: (error) => {
      toast.error("Error updating the Shopping List item");
      console.error("SHOPPING LIST UPDATE API ERROR: ", error);
    },
  });

  // Toggle shopping list item completion
  const toggleItemMutation = useMutation({
    mutationFn: async ({ itemId, vehicleId, purchased }: { itemId: string; vehicleId: string; purchased: boolean }) => {
      console.log("Toggling item:", itemId, "to purchased:", purchased);
      const response = await api.patch(`/shopping-list/${itemId}/toggle`, {
        isPurchased: purchased,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"], exact: true });
      queryClient.invalidateQueries({
        queryKey: ["shopping-list", "vehicle", variables.vehicleId],
        exact: true,
      });
    },
    onError: (error) => {
      toast.error("Error toggling the Shopping List item");
      console.error("SHOPPING LIST TOGGLE API ERROR: ", error);
    },
  });

  // Delete shopping list item
  const deleteItemMutation = useMutation({
    mutationFn: async ({ itemId, vehicleId }: { itemId: string; vehicleId: string }) => {
      const response = await api.delete(`/shopping-list/${itemId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"], exact: true });
      queryClient.invalidateQueries({
        queryKey: ["shopping-list", "vehicle", variables.vehicleId],
        exact: true,
      });
    },
    onError: (error) => {
      toast.error("Error deleting the Shopping List item");
      console.error("SHOPPING LIST DELETION API ERROR: ", error);
    },
  });

  return {
    // All Shopping List Query
    allShoppingList: allShoppingQuery.data,
    allShoppingListLoading: allShoppingQuery.isLoading,
    allShoppingListError: allShoppingQuery.error,
    refetchAllShoppingList: allShoppingQuery.refetch,

    // Vehicle Shopping List Query
    vehicleShoppingList: vehicleShoppingListQuery.data,
    vehicleShoppingListLoading: vehicleShoppingListQuery.isLoading,
    vehicleShoppingListError: vehicleShoppingListQuery.error,
    refetchVehicleShoppingList: vehicleShoppingListQuery.refetch,

    // Create Mutation
    createItem: createItemMutation.mutate,
    createItemAsync: createItemMutation.mutateAsync,
    isCreating: createItemMutation.isPending,
    createError: createItemMutation.error,

    // Update Mutation
    updateItem: updateItemMutation.mutate,
    updateItemAsync: updateItemMutation.mutateAsync,
    isUpdating: updateItemMutation.isPending,
    updateError: updateItemMutation.error,

    // Toggle Mutation
    toggleItem: toggleItemMutation.mutate,
    toggleItemAsync: toggleItemMutation.mutateAsync,
    isToggling: toggleItemMutation.isPending,

    // Delete Mutation
    deleteItem: deleteItemMutation.mutate,
    deleteItemAsync: deleteItemMutation.mutateAsync,
    isDeleting: deleteItemMutation.isPending,
    deleteError: deleteItemMutation.error,
  };
}
