import { z } from "zod";
import { TodoPriority } from "./todo.types";

export const TodoSchema = z.object({
  vehicleId: z.string().min(1, "Ajoneuvon ID on pakollinen").trim(),
  // Mandatory Title
  title: z
    .string()
    .min(1, "Tehtävän otsikko on pakollinen")
    .trim()
    .max(100, "Otsikko saa olla enintään 100 merkkiä pitkä"),
  // Optional Description
  description: z.string().max(500, "Kuvaus saa olla enintään 500 merkkiä pitkä").optional().nullable().default(null),
  priority: z.enum(TodoPriority).nullable().optional().default(null),
  // Optional Due Date
  dueDate: z.coerce.date().optional().nullable().default(null),
  dueOdometer: z.coerce.number().optional().nullable().default(null),
});

export type TodoSchemaType = z.infer<typeof TodoSchema>;
