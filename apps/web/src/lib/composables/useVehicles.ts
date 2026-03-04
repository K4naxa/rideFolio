import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries.ts";

export const useVehicles = () => {
  const { data: vehicles } = useVehiclesAll();

  function getVehicleNameById(id: string) {
    return vehicles.value?.find((vehicle) => vehicle.vehicleData.id === id)?.vehicleData.name;
  }

  return { getVehicleNameById };
};
