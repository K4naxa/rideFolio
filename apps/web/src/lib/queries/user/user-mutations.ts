import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import type { ProfileUpdateValues } from "@repo/validation";
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
