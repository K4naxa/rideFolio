export type volumeUnitTypes = "LITER" | "GALLON";
export type VolumeUnitOption = { value: volumeUnitTypes; label: string };
export const volumeUnitValues: VolumeUnitOption[] = [
  { value: "LITER", label: "Litra" },
  { value: "GALLON", label: "Gallona" },
];

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

import { OdometerTypes } from "../vehicle";

export type currencyTypes = "EUR" | "USD" | "GBP" | "JPY" | "CNY" | "INR" | "RUB" | "AUD" | "CAD" | "CHF";
export const currencyTypeValues: currencyTypes[] = [
  "EUR",
  "USD",
  "GBP",
  "JPY",
  "CNY",
  "INR",
  "RUB",
  "AUD",
  "CAD",
  "CHF",
];

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
    odometerType: OdometerTypes;
    volumeUnit: volumeUnitTypes;
    consumptionUnit_distance: string;
    consumptionUnit_Hour: string;
    currency: currencyTypes;
  };
};
