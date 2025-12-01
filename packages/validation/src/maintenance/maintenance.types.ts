export type TValidPartLocation = {
  id: string;
  code: string;
  nameKey: string;
};
export type TMaintenanceCategoryPart = {
  categoryId: string;
  code: string;
  id: string;
  nameKey: string;
  validLocations?: TValidPartLocation[];
};

export type MaintenanceType = {
  code: string;
  nameKey: string;
  icon: string | null;
  id: string;
};

export type TMaintenanceFormPart = {
  partId: string;
  groupId: string;
  nameKey: string;
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
  nameKey: string;
  sortOrder: number;
  parts: TMaintenanceCategoryPart[];
};
