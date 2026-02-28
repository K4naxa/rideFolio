import { ActiveSubscriptionPlan } from "../subscription";

// Volume units
export const VOLUME_UNITS = {
  LITER: {
    code: "LITER",
    label: "Liter",
    unit: "L",
    nameKey: "user.volumeUnits.liter",
  },
  GALLON: {
    code: "GALLON",
    label: "Gallon",
    unit: "gal",
    nameKey: "user.volumeUnits.gallon",
  },
} as const;
export type VolumeUnitCode = keyof typeof VOLUME_UNITS;
export const volumeUnitCodes = Object.keys(VOLUME_UNITS) as VolumeUnitCode[];
export function getVolumeUnit(code: string | undefined): string {
  if (!code) return "";
  return VOLUME_UNITS[code as VolumeUnitCode]?.unit;
}
export function getVolumeUnitNamekey(code: string): string {
  return VOLUME_UNITS[code as VolumeUnitCode]?.label;
}

// Consumption units
export const CONSUMPTION_UNITS = {
  KILOMETERS_PER_LITER: {
    code: "KILOMETERS_PER_LITER",
    odometerType: "distance",
    unit: "Km / L",
    nameKey: "user.consumptionUnits.kmPerL",
  },
  LITERS_PER_100KM: {
    code: "LITERS_PER_100KM",
    odometerType: "distance",
    unit: "L / 100 km",
    nameKey: "user.consumptionUnits.lPer100km",
  },
  MILES_PER_LITER: {
    code: "MILES_PER_LITER",
    odometerType: "distance",
    unit: "Miles / L",
    nameKey: "user.consumptionUnits.milesPerL",
  },

  GALLONS_PER_100_MILES: {
    code: "GALLONS_PER_100_MILES",
    odometerType: "distance",
    unit: "Gallons / 100 Miles",
    nameKey: "user.consumptionUnits.gallonsPer100miles",
  },
  MILES_PER_GALLON: {
    code: "MILES_PER_GALLON",
    odometerType: "distance",
    unit: "MPG",
    nameKey: "user.consumptionUnits.mpg",
  },
  KILOMETERS_PER_GALLON: {
    code: "KILOMETERS_PER_GALLON",
    odometerType: "distance",
    unit: "Km / Gallon",
    nameKey: "user.consumptionUnits.kmPerGallon",
  },
  GALLONS_PER_LITER: {
    code: "GALLONS_PER_LITER",
    odometerType: "distance",
    unit: "Gallons / L",
    nameKey: "user.consumptionUnits.gallonsPerL",
  },

  LITERS_PER_HOUR: {
    code: "LITERS_PER_HOUR",
    odometerType: "hour",
    unit: "L / Hour",
    nameKey: "user.consumptionUnits.lPerHour",
  },
  HOURS_PER_LITER: {
    code: "HOURS_PER_LITER",
    odometerType: "hour",
    unit: "Hours / L",
    nameKey: "user.consumptionUnits.hoursPerL",
  },

  GALLONS_PER_HOUR: {
    code: "GALLONS_PER_HOUR",
    odometerType: "hour",
    unit: "Gallons / Hour",
    nameKey: "user.consumptionUnits.gallonsPerHour",
  },
  HOURS_PER_GALLON: {
    code: "HOURS_PER_GALLON",
    odometerType: "hour",
    unit: "Hours / Gallon",
    nameKey: "user.consumptionUnits.hoursPerGallon",
  },
};
export const consumptionUnits_distance = Object.values(
  CONSUMPTION_UNITS,
).filter((unit) => unit.odometerType === "distance");
export const consumptionUnitCodes_distance = consumptionUnits_distance.map(
  (v) => v.code,
);

export const consumptionUnits_hour = Object.values(CONSUMPTION_UNITS).filter(
  (unit) => unit.odometerType === "hour",
);
export const consumptionUnitCodes_hour = consumptionUnits_hour.map(
  (v) => v.code,
);

export type ConsumptionUnitCode = keyof typeof CONSUMPTION_UNITS;
export function getConsumptionUnitNamekey(code: string): string {
  return CONSUMPTION_UNITS[code as ConsumptionUnitCode]?.unit;
}

// Currency codes
export const CURRENCIES = {
  USD: { code: "USD", symbol: "$", name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee" },
  RUB: { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
} as const;
export type CurrencyCode = keyof typeof CURRENCIES;
export const currencyCodes = Object.keys(CURRENCIES) as CurrencyCode[];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES[code as CurrencyCode]?.symbol || code;
}

export function getCurrencyName(code: string): string {
  return CURRENCIES[code as CurrencyCode]?.name || code;
}

export type TSessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export type UserMinimal = {
  id: string;
  name: string;
  image: string | null;
};

export type TBasicProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
  subscriptionPlan: ActiveSubscriptionPlan;
  usedStorageBytes: number;
  usedVehicles: number;

  preferences: {
    volumeUnit: VolumeUnitCode;
    consumptionUnitCode_distance: string;
    consumptionUnitCode_hour: string;
    currency: CurrencyCode;
  };
};

type StorageCategoryBreakdown = {
  category: string;
  bytes: number;
};

export type StorageBreakdown = {
  usage: number;
  breakdown: StorageCategoryBreakdown[];
};
