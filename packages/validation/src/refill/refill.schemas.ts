// ** Vehicle Refill Schema **

import * as z from "zod";

export const RefillSchema = z.object({
  vehicleId: z.cuid("Invalid Vehicle"),
  date: z.coerce.date("Select a date").refine((date) => date <= new Date(), {
    message: "Date cant be in the future",
  }),
  odometer: z.coerce
    .number("Odometer required")
    .min(0, "Odometer cannot be negative"),

  // Fixed boolean handling - simplified approach
  fullRefill: z.preprocess(
    (val) => (typeof val === "string" ? val !== "false" : val),
    z.boolean("Invalid value"),
  ),

  skippedRefill: z.preprocess(
    (val) => (typeof val === "string" ? val !== "false" : val),
    z.boolean("Invalid value"),
  ),

  fuelAmount: z.coerce.number("add amount").min(0.01, "invalid value"),
  pricePerUnit: z.coerce
    .number("add unit price")
    .min(0, "invalid value")
    .optional()
    .nullable(),

  costTotal: z.coerce
    .number("add cost")
    .min(0, "invalid value")
    .optional()
    .nullable(),

  notes: z.string().optional().nullable(),
});

export type RefillSchemaInput = z.input<typeof RefillSchema>;
export type RefillSchemaOutput = z.output<typeof RefillSchema>;
