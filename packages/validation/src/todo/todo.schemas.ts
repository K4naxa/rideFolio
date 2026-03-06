import { z } from "zod";

export const TodoSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle required").trim(),
  // Mandatory Title
  title: z
    .string()
    .min(1, "Required")
    .trim()
    .max(100, "100 Character limit passed"),
  // Optional Description
  description: z
    .string()
    .max(500, "500 Character limit passed")
    .optional()
    .nullable(),
  // Optional Due Date
  dueDate: z.coerce.date().optional().nullable(),
  dueOdometer: z.coerce.number().optional().nullable(),
});

export type TodoSchemaType = z.infer<typeof TodoSchema>;
