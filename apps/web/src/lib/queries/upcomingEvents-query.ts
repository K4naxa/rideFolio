import { fetchApi } from "@/lib/api";
import type { UpcomingEvent } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";
import { unref, type MaybeRef } from "vue";

export const useUpcomingEventsQuery = (vehicleId?: MaybeRef<string>) => {
  const id = unref(vehicleId);

  return useQuery({
    queryKey: ["upcoming Events", id],
    queryFn: async () => await fetchApi<UpcomingEvent[]>(`vehicles/upcoming-events/${id || ""}`),
  });
};
