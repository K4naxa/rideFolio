import * as z from "zod";
import { TMaintenanceTypes } from "./maintenance.types";

const BaseMaintenanceSchema = z.object({
  vehicleId: z.cuid("Ajoneuvon ID on virheellinen"),
  date: z.coerce.date("Valitse päivämäärä"),
  odometer: z.coerce.number("Täytä ajokilometrit").min(0, "Ajokilometrit eivät voi olla negatiivisia"),
  maintenanceType: z.enum(TMaintenanceTypes, { message: "Valitse huollon tyyppi" }),
  serviceProvider: z
    .string()
    .max(255, "Huoltoliikkeen nimi voi olla enintään 255 merkkiä pitkä")
    .nullable()
    .default(null),
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
      message: "Vain JPG, JPEG, PNG tai GIF -kuvat sallitaan.",
    })
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: "Tiedoston maksimikoko on 5MB.",
    })
    .nullable()
    .default(null),
});
export type TCreateMaintenanceFrontendSchema = z.infer<typeof MaintenanceFrontendSchema>;

export const MaintenanceBackendSchema = BaseMaintenanceSchema.extend({
  image: z.url().optional().nullable().default(null),
});
export type TMaintenanceBackendSchema = z.infer<typeof MaintenanceBackendSchema>;
