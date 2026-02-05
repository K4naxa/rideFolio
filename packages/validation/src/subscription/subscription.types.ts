export type ActiveSubscriptionPlan = {
  id: string;
  code: string;
  nameKey: string;
  maxStorageBytes: number; // Use -1 for Unlimited.
  maxVehicles: number; // Use -1 for Unlimited.
  priceCents: number;
};
