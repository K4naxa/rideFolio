import { z } from "zod";
import { fuelTypeValues, OdometerTypeValues, VehicleTypeCodes } from "./vehicle.types";

export const BaseVehicleSchema = z.object({
  // Mandatory Name
  name: z.string().min(1, "Vehicle name is required").trim().max(50, "Name can be at most 50 characters long"),

  // Optional Make
  make: z.string().max(20, "Manufacturer name can be at most 20 characters long").nullable().optional(),

  // Optional Model
  model: z.string().max(20, "Model name can be at most 20 characters long").nullable().optional(),

  // Mandatory Vehicle Type
  type: z.enum(VehicleTypeCodes, {
    message: "Vehicle type is required",
  }),

  // Optional Year
  year: z.coerce.number().nullable().optional(),

  // Optional odometer count
  odometer: z.coerce.number().nullable().optional(),

  // Mandatory odometer type
  odometerType: z.enum(
    OdometerTypeValues.map((v) => v.value),
    {
      message: "Odometer type is required",
    }
  ),

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
  fuelType: z.enum(
    fuelTypeValues.map((v) => v.value),
    {
      message: "Fuel type is required",
    }
  ),
});

export const CreateVehicleFrontendSchema = BaseVehicleSchema.extend({
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
export type CreateVehicleFrontendSchemaType = z.infer<typeof CreateVehicleFrontendSchema>;

export const CreateVehicleBackendSchema = BaseVehicleSchema.extend({
  image: z.url().nullable().optional().default(null),
});
export type CreateVehicleBackendSchemaType = z.infer<typeof CreateVehicleBackendSchema>;
