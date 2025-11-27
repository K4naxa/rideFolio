import { TConversionResult } from "../vehicle";

export interface TRefillForClient {
  id: string;
  vehicleId: string;
  creator: {
    id: string;
    name: string;
    image: string | null;
  };
  date: Date;
  odometer: TConversionResult;
  fullRefill: boolean;
  skippedRefill: boolean;
  fuelVolume: TConversionResult;
  pricePerUnit: number | null;
  costTotal: number | null;
  notes: string | null;
  consumption: TConversionResult | null;
}
