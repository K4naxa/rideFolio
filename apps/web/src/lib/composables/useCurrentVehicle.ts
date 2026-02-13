import { useRoute } from "vue-router";
import { computed } from "vue";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries";

export function useCurrentVehicle() {
  const route = useRoute();

  // Get active vehicle ID from URL params
  const currentVehicleId = computed(() => {
    return route.params.vehicleId as string | undefined;
  });

  // Check if there's an active vehicle
  const hasCurrentVehicle = computed(() => !!currentVehicleId.value);

  // Get the full vehicle data from the accessible vehicles list
  const { data: vehicles } = useVehiclesAll();

  const currentVehicle = computed(() => {
    if (!currentVehicleId.value || !vehicles.value) return null;
    return vehicles.value.find((v) => v.vehicleData.id === currentVehicleId.value);
  });

  const isVehicleOwner = computed(() => {
    if (!currentVehicle.value) return false;
    return currentVehicle.value.isOwnerUser;
  });

  const currentVehicleName = computed(() => currentVehicle.value?.vehicleData.name);
  return {
    currentVehicleId,
    hasCurrentVehicle,
    currentVehicle,
    currentVehicleName,
    isVehicleOwner,
  };
}
