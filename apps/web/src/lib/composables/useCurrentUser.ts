import { useUserQuery } from "@/lib/queries/user/user-queries";
import { computed } from "vue";

export function useCurrentUser() {
  const { data: currentUser } = useUserQuery();
  const userPreferences = computed(() => currentUser.value?.preferences || {});

  return {
    currentUser,
    userPreferences,
  };
}
