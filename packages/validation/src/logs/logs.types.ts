import { TConversionResult } from "../vehicle";

export interface RecentActivityQueryOptions {
  vehicleId?: string;
  poolId?: string;
  owned?: boolean | "true" | "false";
  take: number;
  cursor?: { date: string; id: string };
}

export interface RecentActivityInfiniteResponse {
  items: RecentActivityItem[];
  nextCursor: string | null;
}

export type RecentActivityItem = RefillActivity | MaintenanceActivity;

interface BaseActivity {
  date: Date;
  vehicle: { name: string; type: string; image: string | null };
}

export interface RefillActivity extends BaseActivity {
  type: "refill";
  data: RefillActivityData;
}

export interface MaintenanceActivity extends BaseActivity {
  type: "maintenance";
  data: MaintenanceActivityData;
}

export interface RefillActivityData {
  id: string;
  date: Date;
  fullRefill: boolean;
  skippedRefill: boolean;
  fuelAmount: TConversionResult;
  costTotal: number | null;
  notes: string | null;
  consumption: TConversionResult;
  odometer: TConversionResult;
}

export interface MaintenanceActivityData {
  id: string;
  date: Date;
  type: {
    code: string;
    nameKey: string;
    icon: string | null;
  };
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
}
