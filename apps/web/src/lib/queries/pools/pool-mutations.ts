import { api } from "@/lib/api";
import type { PoolSchemaValues } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useRouter } from "vue-router";

export function usePoolCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["pool-create"],
    mutationFn: async (data: PoolSchemaValues) => {
      const response = await api.post<{ newPoolId: string }>("/pools", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
    },
  });
}
