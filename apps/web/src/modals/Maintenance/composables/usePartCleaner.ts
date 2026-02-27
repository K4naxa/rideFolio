import type {
  MaintenanceCategoryPart,
  MaintenanceCategoryWithParts,
  MaintenancePartInput,
  PartLocation,
} from "@repo/validation";
import { type MaybeRef, unref } from "vue";

// Composable for data cleanup when vehicle type changes
// Ensures parts are valid for the new vehicle type
// Removes incompatible parts and updates locations as needed

export function usePartCleaner() {
  const findPartInCategories = (
    partId: string,
    categories: MaintenanceCategoryWithParts[],
  ): MaintenanceCategoryPart | undefined => {
    return categories.flatMap((cat) => cat.parts).find((p) => p.id === partId);
  };

  //   check if locations match the new part
  const areLocationsValid = (locations: PartLocation[], validLocations: PartLocation[] | undefined): boolean => {
    if (!locations || locations.length === 0) return true;
    if (!validLocations || validLocations.length === 0) return false;

    return locations.every((location) => validLocations.some((validLoc) => validLoc.id === location.id));
  };

  const findCompatibleLocations = (
    currentLocations: PartLocation[] | undefined,
    newValidLocations: PartLocation[] | undefined,
  ): PartLocation[] => {
    if (!currentLocations || !newValidLocations || newValidLocations.length === 0) {
      return [];
    }

    const compatibleLocations: PartLocation[] = [];

    for (const currentLocation of currentLocations) {
      const matchingLocation = newValidLocations.find((loc) => loc.code === currentLocation.code);

      if (matchingLocation) {
        compatibleLocations.push(matchingLocation);
      }
    }

    return compatibleLocations;
  };

  /**
   * Main cleanup function: Filters and updates parts based on new vehicle type
   */
  const cleanupPartsForVehicleType = (
    currentParts: MaybeRef<MaintenancePartInput[]>,
    newCategories: MaintenanceCategoryWithParts[],
  ): MaintenancePartInput[] => {
    const cleanedParts: MaintenancePartInput[] = [];

    for (const part of unref(currentParts)) {
      // Check if part exists in new vehicle type's categories
      const newCategoryPart = findPartInCategories(part.partId, newCategories);

      if (!newCategoryPart) {
        continue;
      }

      // Part exists: check location compatibility
      const areCurrentLocationsValid = areLocationsValid(part.locations, newCategoryPart.validLocations);

      if (areCurrentLocationsValid) {
        cleanedParts.push({
          ...part,
          locations: part.locations,
        });
      } else {
        const compatibleLocations = findCompatibleLocations(part.locations, newCategoryPart.validLocations);

        cleanedParts.push({
          ...part,
          locations: compatibleLocations,
        });
      }
    }

    return cleanedParts;
  };

  return {
    cleanupPartsForVehicleType,
    findPartInCategories,
    areLocationsValid,
    findCompatibleLocations,
  };
}
