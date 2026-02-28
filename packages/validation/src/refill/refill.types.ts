import { TConversionResult } from "../vehicle";
import { UserMinimal } from "../user";

export interface TRefillForClient {
  id: string;

  date: Date;
  odometer: TConversionResult;
  fullRefill: boolean;
  skippedRefill: boolean;
  fuelVolume: TConversionResult;
  pricePerUnit: number | null;
  costTotal: number | null;
  notes: string | null;
  consumption: TConversionResult | null;
  creator: UserMinimal | null;
}
