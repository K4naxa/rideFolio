import { z } from "zod";

export const ShoppingListItemSchema = z.object({
  vehicleId: z.string().min(1, "Invalid vehicle").trim(),
  // Mandatory Name
  name: z.string().min(1, "Required").trim().max(100, "100 Character limit passed"),
  // Optional price
  price: z.coerce.number().optional().nullable(),
});

export type ShoppingListItemSchemaType = z.infer<typeof ShoppingListItemSchema>;
