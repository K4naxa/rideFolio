import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import type { PoolInviteValues, PoolSchemaValues } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import axios, { AxiosError } from "axios";
import { toast } from "vue-sonner";

export function usePoolCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["pool-create"],
    mutationFn: async (data: PoolSchemaValues) => {
      const response = await api.post<{ newPoolId: string }>("/pools", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pools.all });
    },
  });
}

export function usePoolInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["pool-invite-user"],
    mutationFn: async (data: PoolInviteValues) => {
      return await api.post("/pools/" + data.poolId + "/invite", data);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) return error as AxiosError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pools.all });
    },
  });
}

export function usePoolInviteCancel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["pool-invite-cancel"],
    mutationFn: async (inviteId: string) => {
      return await api.delete("/pools/invite/" + inviteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pools.all });
    },
  });
}
