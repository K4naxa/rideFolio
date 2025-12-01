import { OdometerTypeCode } from "../vehicle";

// Volume units
export const VOLUME_UNITS = {
  LITER: { code: "LITER", label: "Liter", nameKey: "user.volumeUnits.liter" },
  GALLON: { code: "GALLON", label: "Gallon", nameKey: "user.volumeUnits.gallon" },
} as const;
export type VolumeUnitCode = keyof typeof VOLUME_UNITS;
export const volumeUnitCodes = Object.keys(VOLUME_UNITS) as VolumeUnitCode[];
export function getVolumeUnitNamekey(code: string): string {
  return VOLUME_UNITS[code as VolumeUnitCode]?.label;
}

// Consumption types
export type TConsumption_distance =
  | "KILOMETERS_PER_LITER"
  | "LITERS_PER_100KM"
  | "MILES_PER_LITER"
  | "GALLONS_PER_100_MILES"
  | "MILES_PER_GALLON"
  | "KILOMETERS_PER_GALLON"
  | "GALLONS_PER_LITER";
export type TConsumptionOption_distance = { value: TConsumption_distance; label: string };
export const consumptionTypeValues_distance: TConsumptionOption_distance[] = [
  { value: "KILOMETERS_PER_LITER", label: "Km / L" },
  { value: "LITERS_PER_100KM", label: "L / 100 km" },
  { value: "MILES_PER_LITER", label: "Miles / L" },
  { value: "GALLONS_PER_100_MILES", label: "Gallons / 100 Miles" },
  { value: "MILES_PER_GALLON", label: "MPG" },
  { value: "KILOMETERS_PER_GALLON", label: "Km / Gallon" },
  { value: "GALLONS_PER_LITER", label: "Gallons / L" },
];

export type TConsumption_hour = "LITERS_PER_HOUR" | "HOURS_PER_LITER" | "GALLONS_PER_HOUR" | "HOURS_PER_GALLON";
export type TConsumptionOption_hour = { value: TConsumption_hour; label: string };
export const consumptionTypeValues_hour: TConsumptionOption_hour[] = [
  { value: "LITERS_PER_HOUR", label: "L / Hour" },
  { value: "HOURS_PER_LITER", label: "Hours / L" },
  { value: "GALLONS_PER_HOUR", label: "Gallons / Hour" },
  { value: "HOURS_PER_GALLON", label: "Hours / Gallon" },
];

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

export type TBasicProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
  preferences: {
    odometerType: OdometerTypeCode;
    volumeUnit: VolumeUnitCode;
    consumptionUnit_distance: string;
    consumptionUnit_Hour: string;
    currency: CurrencyCode;
  };
};
