export interface ShoppingListItem {
  id: string;
  vehicleId: string;
  name: string;
  price: number | null;
  isPurchased: boolean;
  createdAt: Date;
  updatedAt: Date;
  purchasedAt: Date | null;
  createdById: string | null;
}
