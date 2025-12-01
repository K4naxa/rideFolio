import * as z from "zod";

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
  odometer: z.coerce.number("required").min(0, "Odometer cannot be negative"),
  typeId: z.string().min(1, "Select maintenance type"),
  serviceProvider: z.string().max(255, "Max length 255 characters").nullable(),
  parts: z.array(
    z.object({
      partId: z.string(),
      groupId: z.string(),
      locationId: z.string().optional().nullable(),
      label: z.string().max(60).optional().nullable(),
      description: z.string().max(255).optional().nullable(),
      customPartLabel: z.string().max(255).optional().nullable(),
    })
  ),
  totalCost: z.coerce.number().nullable(),
  notes: z.string().nullable(),
});
export type TMaintenanceSchema = z.infer<typeof MaintenanceSchema>;
