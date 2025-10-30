import { z } from "zod";
import { fuelTypeValues, OdometerTypeValues, VehicleTypeCodes } from "./vehicle.types";

export const BaseVehicleSchema = z.object({
  // Mandatory Name
  name: z.string().min(1, "Ajoneuvon nimi on pakollinen").trim().max(50, "Nimi saa olla enintään 50 merkkiä pitkä"),

  // Optional Make
  make: z
    .string()
    .optional()
    .nullable()
    .default(null)
    .refine((val) => !val || val.length <= 20, {
      message: "Valmistajan nimi saa olla enintään 20 merkkiä pitkä",
    }),

  // Optional Model
  model: z
    .string()
    .optional()
    .nullable()
    .default(null)
    .refine((val) => !val || val.length <= 20, {
      message: "Mallin nimi saa olla enintään 20 merkkiä pitkä",
    }),

  // Mandatory Vehicle Type
  type: z.enum(VehicleTypeCodes, {
    message: "Ajoneuvon tyyppi on pakollinen",
  }),

  // Optional Year
  year: z.coerce.number().optional().nullable().default(null),

  // Optional odometer count
  odometer: z.coerce.number().optional().nullable().default(null),

  // Mandatory odometer type
  odometerType: z.enum(
    OdometerTypeValues.map((v) => v.value),
    {
      message: "Mitoitusjärjestelmä on pakollinen",
    }
  ),

  // Optional VIN
  vin: z
    .string()
    .trim()
    .optional()
    .nullable()
    .default(null)
    .refine((val) => !val || val.length === 17, {
      message: "VIN numerosarjan pituus pitää olla 17 merkkiä",
    }),

  // Optional License Plate
  licensePlate: z
    .string()
    .trim()
    .optional()
    .nullable()
    .default(null)
    .refine((val) => !val || val.length <= 10, {
      message: "Rekisterikilven tulee olla enintään 10 merkkiä pitkä",
    }),

  // Mandatory Fuel Type
  fuelType: z.enum(
    fuelTypeValues.map((v) => v.value),
    {
      message: "Polttoaineen tyyppi on pakollinen",
    }
  ),
});

export const CreateVehicleFrontendSchema = BaseVehicleSchema.extend({
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
export type CreateVehicleFrontendSchemaType = z.infer<typeof CreateVehicleFrontendSchema>;

export const CreateVehicleBackendSchema = BaseVehicleSchema.extend({
  image: z.url().optional().nullable().default(null),
});
export type CreateVehicleBackendSchemaType = z.infer<typeof CreateVehicleBackendSchema>;
