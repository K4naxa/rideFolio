import type {
  TMaintenanceCategory,
  TMaintenanceCategoryPart,
  TMaintenanceFormPart,
  TValidPartLocation,
} from "@repo/validation";

// Composable for data cleanup when vehicle type changes
// Ensures parts are valid for the new vehicle type
// Removes incompatible parts and updates locations as needed

export function usePartCleaner() {
  const findPartInCategories = (
    partId: string,
    categories: TMaintenanceCategory[],
  ): TMaintenanceCategoryPart | undefined => {
    return categories.flatMap((cat) => cat.parts).find((p) => p.id === partId);
  };

  //   check if locations match the new part
  const isLocationValid = (
    locationId: string | null | undefined,
    validLocations: TValidPartLocation[] | undefined,
  ): boolean => {
    if (!locationId) return true;
    if (!validLocations || validLocations.length === 0) return true;

    return validLocations.some((loc) => loc.id === locationId);
  };

  const findCompatibleLocation = (
    currentLocationId: string | null | undefined,
    currentLocations: TValidPartLocation[] | undefined,
    newValidLocations: TValidPartLocation[] | undefined,
  ): string | null => {
    if (!currentLocationId || !newValidLocations || newValidLocations.length === 0) {
      return null;
    }

    const currentLocation = currentLocations?.find((loc) => loc.id === currentLocationId);

    if (currentLocation) {
      const matchingLocation = newValidLocations.find((loc) => loc.code === currentLocation.code);

      if (matchingLocation) {
        return matchingLocation.id;
      }
    }

    return null;
  };

  /**
   * Main cleanup function: Filters and updates parts based on new vehicle type
   */
  const cleanupPartsForVehicleType = (
    currentParts: TMaintenanceFormPart[],
    newCategories: TMaintenanceCategory[],
  ): TMaintenanceFormPart[] => {
    const cleanedParts: TMaintenanceFormPart[] = [];

    for (const part of currentParts) {
      // Check if part exists in new vehicle type's categories
      const newCategoryPart = findPartInCategories(part.partId, newCategories);

      if (!newCategoryPart) {
        continue;
      }

      // Part exists: check location compatibility
      const isCurrentLocationValid = isLocationValid(part.locationId, newCategoryPart.validLocations);

      if (isCurrentLocationValid) {
        cleanedParts.push({
          ...part,
          validLocations: newCategoryPart.validLocations,
        });
      } else {
        const compatibleLocationId = findCompatibleLocation(
          part.locationId,
          part.validLocations,
          newCategoryPart.validLocations,
        );

        cleanedParts.push({
          ...part,
          locationId: compatibleLocationId,
          validLocations: newCategoryPart.validLocations,
        });
      }
    }

    return cleanedParts;
  };

  return {
    cleanupPartsForVehicleType,
    findPartInCategories,
    isLocationValid,
    findCompatibleLocation,
  };
}
