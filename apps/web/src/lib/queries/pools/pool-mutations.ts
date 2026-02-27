import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import {
  type AccessiblePool,
  type PoolDetails,
  type PoolInviteValues,
  type PoolMemberRoleCode,
  type PoolSchemaValues,
} from "@repo/validation";
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
    onSuccess: (data, variables) => {
      queryClient.setQueryData<AccessiblePool[]>(queryKeys.pools.all, (oldData) => {
        if (!oldData) return oldData;

        const newPool = {
          name: variables.name,
          id: data.newPoolId,
          type: variables.type,
        };

        return [...oldData, newPool];
      });
    },
  });
}

export function usePoolUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["pool", "update"],
    mutationFn: async ({ poolId, values }: { poolId: string; values: PoolSchemaValues }) => {
      const response = await api.put<PoolDetails>(`/pools/${poolId}`, values);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<PoolDetails>(queryKeys.pools.detail(data.id), (oldData) => {
        if (!oldData) return oldData;
        return data;
      });

      queryClient.setQueryData<AccessiblePool[]>(queryKeys.pools.all, (oldData) => {
        if (!oldData) return oldData;
        const otherPools = oldData.filter((pool) => pool.id !== data.id);
        return [...otherPools, data];
      });
      toast.success("Group details updated successfully!");
    },
  });
}

export function usePoolAddVehicles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["pool-add-vehicles"],
    mutationFn: async ({ poolId, vehicleIds }: { poolId: string; vehicleIds: string[] }) => {
      const response = await api.patch<PoolDetails>(`/pools/vehicles/add/${poolId}`, { vehicleIds });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<PoolDetails>(queryKeys.pools.detail(data.id), (oldData) => {
        if (!oldData) return oldData;
        return data;
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function usePoolRemoveVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["pool-remove-vehicle"],
    mutationFn: async ({ poolId, vehicleId }: { poolId: string; vehicleId: string }) => {
      const response = await api.patch(`/pools/vehicle/remove/${poolId}`, { vehicleId });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<PoolDetails>(queryKeys.pools.detail(variables.poolId), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          vehicles: oldData.vehicles.filter((vehicle) => vehicle.data.id !== variables.vehicleId),
        };
      });

      // Vehicle can be accessible from other groups, so invalidate entire vehicles list to ensure all data is up to date
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
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
      return await api.post("/pools/leave/" + poolId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pools.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function usePoolUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["pool-update-user-role"],
    mutationFn: async (data: { poolId: string; userId: string; role: PoolMemberRoleCode }) => {
      return await api.patch("/pools/" + data.poolId + "/members/" + data.userId + "/role", { role: data.role });
    },
    onSuccess: (_, variants) => {
      if (variants.role === "OWNER") {
        // On owner transfer, invalidate entire pool details to reflect changes to current user's role
        queryClient.invalidateQueries({ queryKey: queryKeys.pools.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.pools.detail(variants.poolId) });
      } else {
        queryClient.setQueryData<PoolDetails>(queryKeys.pools.detail(variants.poolId), (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            members: oldData.members.map((member) => {
              if (member.user.id === variants.userId) {
                return {
                  ...member,
                  role: variants.role,
                };
              }
              return member;
            }),
          };
        });
      }
    },
  });
}

export function usePoolMemberRemove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["pool-remove-member"],
    mutationFn: async ({ poolId, userId }: { poolId: string; userId: string }) => {
      console.log("Removing member with userId:", userId, "from pool with poolId:", poolId);
      return await api.delete(`/pools/${poolId}/members/${userId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pools.detail(variables.poolId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function usePoolInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["pool-invite-user"],
    mutationFn: async (data: PoolInviteValues) => {
      return await api.post("/pools/" + data.poolId + "/invites", data);
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
      return await api.delete("/pools/invites/" + inviteId);
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
      return await api.post("/pools/invites/" + inviteId + "/accept");
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
      return await api.post("/pools/invites/" + inviteId + "/deny");
    },
  });
}
