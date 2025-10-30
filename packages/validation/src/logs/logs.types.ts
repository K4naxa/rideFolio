import { TVehicleTypeCode } from "../vehicle";

export interface RecentActivityQueryOptions {
  vehicleId?: string;
  poolId?: string;
  owned?: boolean | "true" | "false";
  take: number;
  cursor?: { date: string; id: string };
}

export interface RecentActivityInfiniteResponse {
  items: RecentActivityItem[];
  nextCursor: { date: string; id: string } | null;
  name: string | null;
}

export interface RecentActivityItem {
  type: "refill" | "maintenance";
  date: Date;
  vehicle: { name: string; type: TVehicleTypeCode; odometerType: string };
  data: any; // normalized payload
}
