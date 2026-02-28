import { TConversionResult } from "../vehicle";

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

export type ClientMaintenance = {
  id: string;
  date: Date;
  title: string;
  notes: string | null;
  image: string | null;
  costTotal: number | null;

  parts: MaintenancePartDisplay[];
  odometerData: TConversionResult;
};
