import * as z from "zod";
import { TMaintenanceTypes } from "./maintenance.types";

const BaseMaintenanceSchema = z.object({
  vehicleId: z.cuid("Invalid vehicle"),
  date: z.coerce.date("Select a date"),
  odometer: z.coerce.number("required").min(0, "Odometer cannot be negative"),
  maintenanceType: z.enum(TMaintenanceTypes, { message: "Valitse huollon tyyppi" }),
  serviceProvider: z.string().max(255, "Max length 255 characters").nullable().default(null),
  parts: z.array(
    z.object({
      id: z.string(),
      categoryId: z.string(),
      code: z.string(),
      description: z.string().max(255).optional().nullable().default(null),
      customPartType: z.string().max(255).optional().nullable().default(null),
      locationId: z.string().optional().nullable().default(null),
      cost: z.coerce.number().nullable().default(null),
      quantity: z.coerce.number().optional().default(1),
    })
  ),
  totalCost: z.coerce.number().nullable().default(null),
  notes: z.string().nullable().default(null),
});
export const MaintenanceFrontendSchema = BaseMaintenanceSchema.extend({
  image: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(file.type), {
      message: "Only JPG, JPEG, PNG or GIF formats are valid.",
    })
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: "Images max size is 5MB.",
    })
    .nullable()
    .default(null),
});
export type TCreateMaintenanceFrontendSchema = z.infer<typeof MaintenanceFrontendSchema>;

export const MaintenanceBackendSchema = BaseMaintenanceSchema.extend({
  image: z.url().optional().nullable().default(null),
});
export type TMaintenanceBackendSchema = z.infer<typeof MaintenanceBackendSchema>;
