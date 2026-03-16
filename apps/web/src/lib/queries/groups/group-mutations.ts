import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import {
  type AccessibleGroup,
  type GroupDetails,
  type GroupInviteValues,
  type GroupMemberRoleCode,
  type GroupSchemaValues,
} from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import axios, { AxiosError } from "axios";
import { toast } from "vue-sonner";

export function useGroupCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["group-create"],
    mutationFn: async (data: GroupSchemaValues) => {
      const response = await api.post<{ newGroupId: string }>("/groups", data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData<AccessibleGroup[]>(queryKeys.groups.all, (oldData) => {
        if (!oldData) return oldData;

        const newGroup = {
          name: variables.name,
          id: data.newGroupId,
        };

        return [...oldData, newGroup];
      });
    },
  });
}

export function useGroupUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["group", "update"],
    mutationFn: async ({ groupId, values }: { groupId: string; values: GroupSchemaValues }) => {
      const response = await api.put<GroupDetails>(`/groups/${groupId}`, values);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<GroupDetails>(queryKeys.groups.detail(data.id), (oldData) => {
        if (!oldData) return oldData;
        return data;
      });

      queryClient.setQueryData<AccessibleGroup[]>(queryKeys.groups.all, (oldData) => {
        if (!oldData) return oldData;
        const otherGroups = oldData.filter((group) => group.id !== data.id);
        return [...otherGroups, data];
      });
      toast.success("Group details updated successfully!");
    },
  });
}

export function useGroupAddVehicles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["group-add-vehicles"],
    mutationFn: async ({ groupId, vehicleIds }: { groupId: string; vehicleIds: string[] }) => {
      const response = await api.patch<GroupDetails>(`/groups/vehicles/add/${groupId}`, { vehicleIds });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<GroupDetails>(queryKeys.groups.detail(data.id), (oldData) => {
        if (!oldData) return oldData;
        return data;
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function useGroupRemoveVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["group-remove-vehicle"],
    mutationFn: async ({ groupId, vehicleId }: { groupId: string; vehicleId: string }) => {
      const response = await api.patch(`/groups/vehicle/remove/${groupId}`, { vehicleId });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<GroupDetails>(queryKeys.groups.detail(variables.groupId), (oldData) => {
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

export function useGroupDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["group-delete"],
    mutationFn: async (groupId: string) => {
      return await api.delete("/groups/" + groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function useGroupLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["group-leave"],
    mutationFn: async (groupId: string) => {
      return await api.post("/groups/leave/" + groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function useGroupUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["group-update-user-role"],
    mutationFn: async (data: { groupId: string; userId: string; role: GroupMemberRoleCode }) => {
      return await api.patch("/groups/" + data.groupId + "/members/" + data.userId + "/role", { role: data.role });
    },
    onSuccess: (_, variants) => {
      if (variants.role === "OWNER") {
        // On owner transfer, invalidate entire group details to reflect changes to current user's role
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(variants.groupId) });
      } else {
        queryClient.setQueryData<GroupDetails>(queryKeys.groups.detail(variants.groupId), (oldData) => {
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

export function useGroupMemberRemove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["group-remove-member"],
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      return await api.delete(`/groups/${groupId}/members/${userId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function useGroupInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["group-invite-user"],
    mutationFn: async (data: GroupInviteValues) => {
      return await api.post("/groups/" + data.groupId + "/invites", data);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) return error as AxiosError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
}

export function useGroupInviteCancel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["group-invite-cancel"],
    mutationFn: async (inviteId: string) => {
      return await api.delete("/groups/invites/" + inviteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
}

export function useGroupInviteAccept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["group-invite-accept"],
    mutationFn: async (inviteId: string) => {
      return await api.post("/groups/invites/" + inviteId + "/accept");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function useGroupInviteDeny() {
  return useMutation({
    mutationKey: ["group-invite-deny"],
    mutationFn: async (inviteId: string) => {
      return await api.post("/groups/invites/" + inviteId + "/deny");
    },
  });
}
