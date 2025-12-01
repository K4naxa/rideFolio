// Vehicle Fuel Types
export const FUEL_TYPES = {
  GASOLINE: { code: "GASOLINE", label: "Gasoline", nameKey: "vehicle.fuelTypes.gasoline" },
  DIESEL: { code: "DIESEL", label: "Diesel", nameKey: "vehicle.fuelTypes.diesel" },
  HYBRID: { code: "HYBRID", label: "Hybrid", nameKey: "vehicle.fuelTypes.hybrid" },
} as const;
export type FuelTypeCode = keyof typeof FUEL_TYPES;
export const fuelTypeCodes = Object.keys(FUEL_TYPES) as FuelTypeCode[];

// Vehicle Odometer Types
export const ODOMETER_TYPES = {
  KILOMETER: { code: "KILOMETER", unit: "km", label: "Kilometer", nameKey: "vehicle.odometerTypes.kilometer" },
  MILE: { code: "MILE", unit: "mi", label: "Mile", nameKey: "vehicle.odometerTypes.mile" },
  HOUR: { code: "HOUR", unit: "h", label: "Hour", nameKey: "vehicle.odometerTypes.hour" },
} as const;
export type OdometerTypeCode = keyof typeof ODOMETER_TYPES;
export type TOdometerTypeShort = (typeof ODOMETER_TYPES)[OdometerTypeCode]["unit"];
export const odometerTypeCodes = Object.keys(ODOMETER_TYPES) as OdometerTypeCode[];
export const odometerTypeShortCodes = Object.values(ODOMETER_TYPES).map((value) => value.unit);
export function getOdometerNamekey(code: string): string {
  return ODOMETER_TYPES[code as OdometerTypeCode]?.label;
}
export function getOdometerUnit(code: string | undefined): string {
  if (!code) return "";
  return ODOMETER_TYPES[code as OdometerTypeCode]?.unit;
}

export type VehicleType = {
  code: string;
  nameKey: string;
  icon: string | null;
};
export type TConversionResult = {
  value: number;
  unit: string;
  type: string;
};
export type TOdometerData = {
  value: number | null;
  lifeTimeTracked: number | null;
  lastRefillValue: number | null;
  unit: TOdometerTypeShort;
  type: OdometerTypeCode;
};

export type TLogVehicle = {
  id: string;
  name: string;
  make: string | null;
  model: string | null;
  type: string;
  image: string | null;
};

export interface TBasicVehicle {
  id: string;
  name: string;

  type: VehicleType;
  image: string | null;

  make: string | null;
  model: string | null;
  licensePlate: string | null;
  vin: string | null;
  year: number | null;

  fuelType: FuelTypeCode;
  odometerData: TOdometerData;
}

export type TAccessibleVehicle = {
  isOwnerUser: boolean;
  canCreateLogs: boolean;
  canDeleteLogs: boolean;
  canEditLogs: boolean;

  poolId: string | null;

  vehicleData: TBasicVehicle;
};

export type TVehicleOwner = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type TVehicleInfo = {
  id: string;
  name: string;
  make: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
  licensePlate: string | null;
  image: string | null;
  notes: string | null;
  ownerId: string;
  type: VehicleType;
  fuelType: FuelTypeCode;
  odometerData: TOdometerData;
  lifetimeStats: {
    totalTrackedUnits: TConversionResult;
  };
};
