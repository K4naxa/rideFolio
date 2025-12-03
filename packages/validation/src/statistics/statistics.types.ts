import { TConversionResult } from "../vehicle";

export type TStatCardData = {
  trackedUnits: TConversionResult;
  averageConsumption: TConversionResult;
  monthlyRunningCost: number;
};
