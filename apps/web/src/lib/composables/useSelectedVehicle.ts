import type { IconProps } from "@/components/icons/Icon.vue";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries";
import { computed, unref, type MaybeRef } from "vue";

export function useSelectedVehicle(vehicleId: MaybeRef<string | undefined>) {
  const { data: vehicles } = useVehiclesAll();

  const hasSelectedVehicle = computed(() => !!unref(vehicleId));
  const selectedVehicle = computed(() => {
    if (!unref(vehicleId) || !vehicles.value) return undefined;
    return vehicles.value.find((v) => v.vehicleData.id === unref(vehicleId));
  });

  const selectedVehicleIcon = computed(
    () => (selectedVehicle.value?.vehicleData.type.code as IconProps["name"]) || ("" as IconProps["name"]),
  );

  const selectedVehicleOdometerUnit = computed(() => {
    return selectedVehicle.value?.vehicleData.odometerData.unit;
  });

  const selectedVehicleLastRefillOdometer = computed(() => {
    return selectedVehicle.value?.vehicleData.odometerData.lastRefillValue || undefined;
  });

  return {
    hasSelectedVehicle,
    selectedVehicle,
    selectedVehicleIcon,

    selectedVehicleOdometerUnit,
    selectedVehicleLastRefillOdometer,
  };
}
