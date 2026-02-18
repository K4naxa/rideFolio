import { TodoDueDate, TodoDueOdometer } from "../todo";
import { TConversionResult } from "../vehicle";

export interface RecentActivityQueryOptions {
  vehicleId?: string;
  poolId?: string;
  owned?: boolean | "true" | "false";
  take: number;
  cursor?: { date: string; id: string };
}

export interface RecentActivityInfiniteResponse {
  items: (RefillActivity | MaintenanceActivity)[];
  nextCursor: string | null;
}

export type ActivityItem = RefillActivity | MaintenanceActivity | TodoActivity;

interface BaseActivity {
  vehicle: { id: string; name: string; type: string; image: string | null };
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
  data: {
    id: string;
    title: string;
    description: string | null;
    dueDate: TodoDueDate | null;
    dueOdometer: TodoDueOdometer | null;
  };
}
