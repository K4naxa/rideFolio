import { useRoute } from "vue-router";
import { computed } from "vue";
import { useGroupsAll } from "@/lib/queries/groups/group-queries";

export function useCurrentGroup() {
  const route = useRoute();

  // Get active vehicle ID from URL params
  const currentGroupId = computed(() => {
    return route.params.groupId as string | undefined;
  });

  // Check if there's an active vehicle
  const hasCurrentGroup = computed(() => !!currentGroupId.value);

  // Get the full vehicle data from the accessible vehicles list
  const { data: groups } = useGroupsAll();

  const currentGroup = computed(() => {
    if (!currentGroupId.value || !groups.value) return null;
    return groups.value.find((p) => p.id === currentGroupId.value);
  });

  const currentGroupName = computed(() => currentGroup.value?.name);

  return {
    currentGroupId,
    hasCurrentGroup,

    currentGroup,
    currentGroupName,
  };
}
