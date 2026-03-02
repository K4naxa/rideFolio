import { z } from "zod";

export const ShoppingListItemSchema = z.object({
  vehicleId: z.string().min(1, "Invalid vehicle").trim(),
  // Mandatory Name
  name: z
    .string()
    .min(1, "Required")
    .trim()
    .max(100, "100 Character limit passed"),
  // Optional price
  price: z.coerce.number().optional().nullable(),
  isPurchased: z
    .preprocess(
      (val) => (typeof val === "string" ? val !== "false" : val),
      z.boolean(),
    )
    .optional(),
});

export type ShoppingItemValues = z.infer<typeof ShoppingListItemSchema>;
