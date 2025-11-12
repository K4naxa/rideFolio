import z from "zod";

export const NoteSchema = z
  .object({
    vehicleId: z.string().min(1, "Invalid Vehicle").trim(),
    title: z.string().max(100, "100 character limit passed").optional().nullable(),
    content: z
      .string()
      .max(5000, "5000 character limit passed")
      .transform((val) => (val === "" ? null : val))
      .optional()
      .nullable(),
    tags: z.array(z.string().max(30, "30 character limit passed")).optional(),
    pinned: z
      .preprocess(
        (val) => (typeof val === "string" ? (val === "false" ? false : true) : val),
        z.boolean("Invalid value")
      )
      .optional(),
  })
  .refine((data) => !!(data.title && data.title.trim()) || !!(data.content && data.content.trim()), {
    message: "Title or content required",
    path: ["title"], // or ["content"], or just [] for general error
  });

export type NoteSchemaType = z.infer<typeof NoteSchema>;
