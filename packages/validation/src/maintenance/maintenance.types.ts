export const TMaintenanceTypes = [
  "PREVENTIVE",
  "MAINTENANCE",
  "REPAIR",
  "WARRANTY",
  "INSPECTION",
  "DOCUMENTATION",
  "UPGRADE",
  "OTHER",
] as const;
export type TMaintenanceType = (typeof TMaintenanceTypes)[number];
export type TMaintenanceTypeOption = { value: TMaintenanceType; label: string };

export type TValidPartLocation = {
  id: string;
  code: string;
};
export type TMaintenanceCategoryPart = {
  categoryId: string;
  code: string;
  id: string;
  isActive: boolean;
  sortOrder: number;
  validLocations?: TValidPartLocation[];
};

export type TMaintenanceFormPart = {
  partId: string;
  groupId: string;
  code: string;
  locationId?: string | null;
  label?: string | null;
  description?: string | null;
  customPartLabel?: string | null;

  validLocations?: TValidPartLocation[];
};

export type TMaintenanceCategory = {
  id: string;
  code: string;
  sortOrder: number;
  parts: TMaintenanceCategoryPart[];
};
