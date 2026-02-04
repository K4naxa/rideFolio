export type MaintenanceCategoryWithParts = {
  id: string;
  code: string;
  nameKey: string;
  sortOrder: number;
  parts: MaintenanceCategoryPart[];
};

export type MaintenanceCategoryPart = {
  categoryId: string;
  code: string;
  id: string;
  nameKey: string;
  validLocations?: PartLocation[];
};

export type PartLocation = {
  id: string;
  code: string;
  nameKey: string;
};

export type MaintenancePartDisplay = {
  groupId: string;
  partId: string;
  partCode: string;
  partNameKey: string;
  customName?: string | null;
  label?: string | null;
  description?: string | null;
  locations: PartLocation[];
};
