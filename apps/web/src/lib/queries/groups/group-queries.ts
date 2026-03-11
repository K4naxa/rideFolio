import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authClient";
import { queryKeys } from "@/lib/queries/queryKeys";
import { handleEmpty } from "@/lib/queries/util";
import type { AccessibleGroup, GroupDetails } from "@repo/validation";
import { useQuery } from "@tanstack/vue-query";
import { computed, type MaybeRef, unref } from "vue";

export function useGroupsAll() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.groups.all,
    queryFn: async () => fetchApi<AccessibleGroup[]>("groups/accessible"),
    staleTime: 1000 * 60 * 30,
    enabled: isAuthenticated,
  });
}

export function useGroupDetails(groupId: MaybeRef<string | undefined>) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: computed(() => queryKeys.groups.detail(handleEmpty(groupId))),
    queryFn: async () => await fetchApi<GroupDetails>(`groups/${unref(groupId)}`),
    enabled: computed(() => isAuthenticated.value && !!unref(groupId)),
  });
}
