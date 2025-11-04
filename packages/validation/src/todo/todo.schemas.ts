import { z } from "zod";
import { TodoPriority } from "./todo.types";

export const TodoSchema = z.object({
  vehicleId: z.string().min(1, "Ajoneuvon ID on pakollinen").trim(),
  // Mandatory Title
  title: z.string().min(1, "Required").trim().max(100, "100 Character limit passed"),
  // Optional Description
  description: z.string().max(500, "500 Character limit passed").optional().nullable().default(null),
  priority: z.enum(TodoPriority).nullable().optional().default(null),
  // Optional Due Date
  dueDate: z.coerce.date().optional().nullable().default(null),
  dueOdometer: z.coerce.number().optional().nullable().default(null),
});

export type TodoSchemaType = z.infer<typeof TodoSchema>;
