export const FuelTypes = ["GASOLINE", "DIESEL", "HYBRID"] as const;
export type FuelTypes = (typeof FuelTypes)[number];
export type FuelTypeOption = { value: FuelTypes; label: string };

// !Todo: change to use translated labels
export const fuelTypeValues: FuelTypeOption[] = [
  { value: "GASOLINE", label: "Bensiini" },
  { value: "DIESEL", label: "Diesel" },
  { value: "HYBRID", label: "Hybrid" },
];

export type OdometerTypes = "KILOMETER" | "MILE" | "HOUR";
type TOdometerTypeShort = "km" | "mi" | "h";
export type OdometerTypeOption = { value: OdometerTypes; label: string };
export const OdometerTypeValues: OdometerTypeOption[] = [
  { value: "KILOMETER", label: "Kilometri" },
  { value: "MILE", label: "Maili" },
  { value: "HOUR", label: "Tunti" },
];

export const OdometerTypeValuesShort: OdometerTypeOption[] = [
  { value: "KILOMETER", label: "km" },
  { value: "MILE", label: "mi" },
  { value: "HOUR", label: "h" },
];
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
  type: OdometerTypes;
};

export type TLogVehicle = {
  id: string;
  name: string;
  make: string | null;
  model: string | null;
  type: string;
  image: string | null;
};

export const VehicleTypeCodes = ["car", "motorcycle", "boat", "other"] as const;
export type TVehicleTypeCode = (typeof VehicleTypeCodes)[number];
// Function to check if a string is a valid vehicle type code
export function isVehicleTypeCode(code: string): code is TVehicleTypeCode {
  return (VehicleTypeCodes as readonly string[]).includes(code);
}

export interface TBasicVehicle {
  id: string;
  name: string;

  type: TVehicleTypeCode;
  image: string | null;

  make: string | null;
  model: string | null;
  licensePlate: string | null;
  vin: string | null;
  year: number | null;

  fuelType: FuelTypes;
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
  type: TVehicleTypeCode;
  fuelType: FuelTypes;
  odometerData: TOdometerData;
  lifetimeStats: {
    totalTrackedUnits: TConversionResult;
  };
};
