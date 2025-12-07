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

export function usePoolDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["pool-delete"],
    mutationFn: async (poolId: string) => {
      return await api.delete("/pools/" + poolId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pools.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function usePoolLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["pool-leave"],
    mutationFn: async (poolId: string) => {
      return await api.post("/pools/" + poolId + "/leave");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pools.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
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

export function usePoolInviteAccept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["pool-invite-accept"],
    mutationFn: async (inviteId: string) => {
      return await api.post("/pools/invite/" + inviteId + "/accept");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pools.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function usePoolInviteDeny() {
  return useMutation({
    mutationKey: ["pool-invite-deny"],
    mutationFn: async (inviteId: string) => {
      return await api.post("/pools/invite/" + inviteId + "/deny");
    },
  });
}
