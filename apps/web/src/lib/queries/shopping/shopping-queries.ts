import { fetchApi } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import { handleEmpty } from "@/lib/queries/util";
import type { ShoppingItem } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";
import { computed, type MaybeRef, unref } from "vue";

export function useShoppingAll() {
  return useQuery({
    queryKey: queryKeys.shoppingList.all,
    queryFn: async () => {
      return await fetchApi<ShoppingItem[]>(`/shopping-list`);
    },
    enabled: false,
  });
}

export function useVehicleShopping(vehicleId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: computed(() => queryKeys.shoppingList.byVehicle(handleEmpty(vehicleId))),
    queryFn: async () => await fetchApi<ShoppingItem[]>(`/shopping-list/${unref(vehicleId)}`),

    staleTime: 1000 * 60 * 10,
    enabled: computed(() => !!unref(vehicleId)),
  });
}
