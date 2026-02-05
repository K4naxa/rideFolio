import { z } from "zod";
import { fuelTypeCodes, odometerTypeCodes } from "./vehicle.types";

export const VehicleInputSchema = z.object({
  // Mandatory Name
  name: z.string().min(1, "Vehicle name is required").trim().max(50, "Name can be at most 50 characters long"),

  // Optional Make
  make: z.string().max(50, "Manufacturer name can be at most 50 characters long").nullable().optional(),

  // Optional Model
  model: z.string().max(50, "Model name can be at most 50 characters long").nullable().optional(),

  // Mandatory Vehicle Type
  type: z.string().min(1, "Vehicle type is required").trim(),

  // Optional Year
  year: z.coerce.number().nullable().optional(),

  // Optional odometer count
  odometer: z.coerce.number().nullable().optional(),

  // Mandatory odometer type
  odometerType: z.enum(odometerTypeCodes, {
    message: "Odometer type is required",
  }),

  // Optional VIN
  vin: z.string().trim().length(17, "VIN must be exactly 17 characters long").nullable().optional().or(z.literal("")),

  // Optional License Plate
  licensePlate: z
    .string()
    .trim()
    .max(10, "License plate must be at most 10 characters long")
    .nullable()
    .optional()
    .or(z.literal("")),

  // Mandatory Fuel Type
  fuelType: z.enum(fuelTypeCodes, {
    message: "Fuel type is required",
  }),
  image: z
    .instanceof(File)
    .refine((file) => ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(file.type), {
      message: "Only JPG, JPEG, PNG or GIF images are allowed.",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Maximum file size is 5MB.",
    })
    .nullable()
    .optional(),
});

export type VehicleInput = z.infer<typeof VehicleInputSchema>;
