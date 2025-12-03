export interface ShoppingItem {
  id: string;
  name: string;
  vehicleId: string;
  price: number | null;
  isPurchased: boolean;
  updatedAt: Date;
}
export const ShoppingListDB_Select = {
  id: true,
  vehicleId: true,
  name: true,
  price: true,
  isPurchased: true,
  updatedAt: true,
};
export const ShoppingListDB_OrderBy = [{ isPurchased: "asc" as const }, { updatedAt: "desc" as const }];
