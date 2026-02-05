import { useUserQuery } from "@/lib/queries/user/user-queries";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries";
import { getCurrencySymbol, getVolumeUnit, type TBasicProfile } from "@repo/validation";
import { computed } from "vue";

export function useCurrentUser() {
  const { data: currentUser, isLoading } = useUserQuery();
  const { data: vehicles } = useVehiclesAll();

  const userPreferences = computed<TBasicProfile["preferences"] | undefined>(() => currentUser.value?.preferences);
  const preferredCurrencySymbol = computed(() =>
    userPreferences.value ? getCurrencySymbol(userPreferences.value.currency) : undefined,
  );
  const preferredVolumeUnit = computed(() => getVolumeUnit(userPreferences.value?.volumeUnit));
  const usersOwnVehicles = computed(() => vehicles.value?.filter((v) => v.isOwnerUser) || []);

  const canCreateVehicle = computed(() => {
    if (!currentUser.value) return false;
    // Always true for unlimited
    if (currentUser.value.subscriptionPlan.maxVehicles === -1) return true;
    return currentUser.value.usedVehicles < currentUser.value.subscriptionPlan.maxVehicles;
  });

  return {
    isLoading,
    currentUser,
    userPreferences,
    preferredCurrencySymbol,
    preferredVolumeUnit,
    usersOwnVehicles,

    // Limits
    canCreateVehicle,
  };
}
