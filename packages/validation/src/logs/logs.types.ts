import { BaseTodo, TodoDueDate, TodoDueOdometer } from "../todo";
import { TConversionResult, VehicleMinimal } from "../vehicle";

export type ActivityItem = RefillActivity | MaintenanceActivity | TodoActivity;

interface BaseActivity {
  vehicle: VehicleMinimal;
}

export interface RefillActivity extends BaseActivity {
  type: "refill";
  date: Date;
  data: {
    id: string;
    date: Date;
    fullRefill: boolean;
    skippedRefill: boolean;
    fuelAmount: TConversionResult;
    costTotal: number | null;
    notes: string | null;
    consumption: TConversionResult;
    odometer: TConversionResult;
  };
}

export interface MaintenanceActivity extends BaseActivity {
  type: "maintenance";
  date: Date;
  data: {
    id: string;
    date: Date;
    title: string;
    costTotal: number | null;
    notes: string | null;
    odometer: TConversionResult;
    parts: {
      groupId: string;
      partId: string;
      partCode: string;
      label: string | null;
      locations: string[];
    }[];
  };
}

export interface TodoActivity extends BaseActivity {
  type: "todo";
  data: BaseTodo;
}
