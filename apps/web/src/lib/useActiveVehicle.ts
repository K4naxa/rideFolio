import { useRoute } from "vue-router";
import { computed } from "vue";
import { useVehicleQueries } from "@/lib/queries/useVehicleQueries";

export function useActiveVehicle() {
  const route = useRoute();

  // Get active vehicle ID from URL params
  const activeVehicleId = computed(() => {
    return route.params.vehicleId as string | undefined;
  });

  // Check if there's an active vehicle
  const hasActiveVehicle = computed(() => !!activeVehicleId.value);

  // Get the full vehicle data from the accessible vehicles list
  const { vehicles } = useVehicleQueries();

  const activeVehicle = computed(() => {
    if (!activeVehicleId.value || !vehicles.value) return null;
    return vehicles.value.find((v) => v.vehicleData.id === activeVehicleId.value);
  });

  const activeVehicleName = computed(() => activeVehicle.value?.vehicleData.name);

  return {
    activeVehicleId,
    hasActiveVehicle,
    activeVehicle,
    activeVehicleName,
  };
}
