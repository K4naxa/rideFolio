export interface ShoppingItem {
  id: string;
  name: string;
  vehicleId: string;
  price: number | null;
  isPurchased: boolean;
  purchasedAt: Date | null;
  createdAt: Date;
}
export const ShoppingListDB_Select = {
  id: true,
  vehicleId: true,
  name: true,
  price: true,
  isPurchased: true,
  purchasedAt: true,
  createdAt: true,
};
