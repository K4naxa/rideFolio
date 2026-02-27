import { fetchApi } from "@/lib/api";
import { queryKeys } from "@/lib/queries/queryKeys";
import type { ActivityItem } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";
import { type MaybeRef, unref } from "vue";

export const useUpcomingActivityQuery = (vehicleId?: MaybeRef<string>) => {
  const id = unref(vehicleId);

  return useQuery({
    queryKey: queryKeys.user.upcomingActivity,
    queryFn: async () => await fetchApi<ActivityItem[]>(`vehicles/upcoming-activity/${id || ""}`),
  });
};
