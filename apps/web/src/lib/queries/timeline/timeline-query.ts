import { useInfiniteQuery } from "@tanstack/vue-query";
import { queryKeys } from "@/lib/queries/queryKeys.ts";
import { fetchApi } from "@/lib/api.ts";
import type { TimelineQueryInput, TimelineResponse } from "@repo/validation";
import { toQueryString } from "@/lib/queries/util.ts";
import { computed, type Ref, unref } from "vue";

export function useTimelineQuery(filters: Ref<TimelineQueryInput>) {
  return useInfiniteQuery({
    queryKey: computed(() => queryKeys.timelines.filtered(unref(filters))),
    queryFn: async ({ pageParam }) => {
      const qs = toQueryString({ ...unref(filters), cursor: pageParam });
      return await fetchApi<TimelineResponse>(`/timeline?${qs}`);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}
