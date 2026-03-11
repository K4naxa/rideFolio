import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

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
