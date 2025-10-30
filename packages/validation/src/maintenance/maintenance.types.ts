export const TMaintenanceTypes = ["PREVENTIVE", "REPAIR", "INSPECTION", "WARRANTY", "MODIFICATION"] as const;
export type TMaintenanceType = (typeof TMaintenanceTypes)[number];
export type TMaintenanceTypeOption = { value: TMaintenanceType; label: string };

export type TValidPartLocation = {
  id: string;
  code: string;
};
export type TMaintenancePart = {
  categoryId: string;
  code: string;
  id: string;
  isActive: boolean;
  sortOrder: number;
  validLocations?: TValidPartLocation[];
};
export type TMaintenanceCategory = {
  id: string;
  code: string;
  sortOrder: number;
  parts: TMaintenancePart[];
};
