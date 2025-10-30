// ** Vehicle Refill Schema **

import * as z from "zod";

export const RefillSchema = z.object({
  vehicleId: z.cuid("Ajoneuvon ID on virheellinen"),
  date: z.coerce.date("Valitse päivämäärä").refine((date) => date <= new Date(), {
    message: "Päivämäärän tulee olla nykyhetkeä aikaisempi",
  }),
  odometer: z.coerce.number("Täytä ajokilometrit").min(0, "Ajokilometrit eivät voi olla negatiivisia"),

  // Fixed boolean handling - simplified approach
  fullRefill: z.preprocess(
    (val) => (typeof val === "string" ? (val === "false" ? false : true) : val),
    z.boolean("Valitse, tankattiinko täyteen")
  ),

  skippedRefill: z.preprocess(
    (val) => (typeof val === "string" ? (val === "false" ? false : true) : val),
    z.boolean("Valitse, ohitettiinko tankkaus")
  ),

  fuelAmount: z.coerce.number("Lisää polttoaineen määrä").min(0.01, "invalid value"),
  pricePerUnit: z.coerce.number("Lisää hinta per yksikkö").min(0, "invalid value"),

  totalCost: z.coerce.number("Lisää kokonaiskustannus").min(0, "invalid value"),

  notes: z.string().optional().nullable().default(null),
});

export type RefillSchemaInput = z.input<typeof RefillSchema>;
export type RefillSchemaOutput = z.output<typeof RefillSchema>;
