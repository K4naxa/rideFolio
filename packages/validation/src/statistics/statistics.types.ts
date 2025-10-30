import { TConversionResult } from "../vehicle";

export type TVehicleMontlyStats = {
  year: number;
  month: number;
  monthlyRunningCost: number;

  fuelData: {
    consumed: {
      value: number;
      unit: string; // This should match the user's preferred volume unit
      type: string; // This should match the user's preferred volume unit
    };
    cost: {
      value: number;
    };
  };

  totalOdometerData: TConversionResult;

  avgConsumptionData: {
    value: number;
    unit: string; // This should match the user's preferred consumption unit
    type: string; // This should match the user's preferred consumption unit
  };
};

export type TStatCardData = {
  trackedUnits: TConversionResult;
  monthlyAverageConsumption: TConversionResult & {
    trend: "up" | "down" | undefined;
    trendValue: number | null;
  };
  monthlyRunningCost: {
    value: number;
  };
};
