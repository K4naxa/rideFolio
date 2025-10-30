import { z } from "zod";

export const ShoppingListItemSchema = z.object({
  vehicleId: z.string().min(1, "Ajoneuvon ID on pakollinen").trim(),
  // Mandatory Name
  name: z.string().min(1, "Tuotteen nimi on pakollinen").trim().max(100, "Nimi saa olla enintään 100 merkkiä pitkä"),
  // Optional price
  price: z.coerce.number().optional().nullable().default(null),
  // isPurchased flag
  isPurchased: z
    .preprocess(
      (val) => (typeof val === "string" ? (val === "false" ? false : true) : val),
      z.boolean("isPurchased täytyy olla boolean-arvo")
    )
    .optional()
    .default(false),
});

export type ShoppingListItemSchemaType = z.infer<typeof ShoppingListItemSchema>;
