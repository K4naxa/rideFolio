import * as z from "zod";

export const MaintenancePartSchema = z.object({
  partId: z.cuid(),
  partCode: z.string(),
  partNameKey: z.string(),
  groupId: z.string(),
  categoryCode: z.string(),
  categoryNameKey: z.string(),
  customName: z.string().max(255).optional().nullable(),
  label: z.string().max(60).optional().nullable(),
  description: z.string().max(255).optional().nullable(),
  locations: z.array(
    z.object({
      id: z.string(),
      code: z.string(),
      nameKey: z.string(),
    }),
  ),
});
export type MaintenancePartInput = z.infer<typeof MaintenancePartSchema>;

export const MaintenanceSchema = z.object({
  vehicleId: z.cuid("Select a vehicle"),
  date: z.coerce.date("Select a date"),
  image: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(file.type), {
      message: "Only JPG, JPEG, PNG or GIF formats are valid.",
    })
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: "Images max size is 5MB.",
    })
    .nullable(),
  odometer: z.coerce.number("odometer value required").min(0, "Odometer cannot be negative"),
  title: z.string("Give a title").max(100, "Max length 100 characters"),
  serviceProvider: z.string().max(255, "Max length 255 characters").nullable(),
  parts: z.array(MaintenancePartSchema),
  totalCost: z.coerce.number().nullable(),
  notes: z.string().max(1000, "Max length 1000 characters").nullable(),
});
export type MaintenanceInput = z.infer<typeof MaintenanceSchema>;
