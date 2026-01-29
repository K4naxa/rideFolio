import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import type { Notification, ProfileUpdateValues } from "@repo/validation";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useUserUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update", "user-profile"],
    mutationFn: async (data: ProfileUpdateValues) => {
      return api.patch("users/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.basicProfile });
      toast.success("Profile updated successfully");
    },
  });
}

export function useUserPreferenceUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preference: { key: string; value: string }) => {
      const res = await api.patch("/users/preferences", {
        key: preference.key,
        value: preference.value,
      });
      return res.data;
    },
    mutationKey: ["update", "user-preference"],
    onSuccess: (data, variables) => {
      if (
        variables.key === "volumeUnit " ||
        variables.key === "consumptionUnitCode_distance" ||
        variables.key === "consumptionUnitCode_fuel"
      ) {
        queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.timelines.all });
      }
      console.log("Preference updated successfully:", data);
      queryClient.setQueryData(queryKeys.user.basicProfile, data);
    },
  });
}

export function useUserNotificationsMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["notifications", "markAsRead"],
    mutationFn: async (notificationId: string) => {
      return await api.patch("/users/notifications/" + notificationId + "/read");
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Notification[]>(queryKeys.user.notifications, (old) => {
        if (!old) return old;
        return old.map((notification) =>
          notification.id === variables
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification,
        );
      });
    },
  });
}
