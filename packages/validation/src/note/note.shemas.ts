import z from "zod";

export const NoteSchema = z
  .object({
    vehicleId: z.string().min(1, "Ajoneuvon ID on pakollinen").trim(),
    title: z.string().max(100, "Otsikko saa olla enintään 100 merkkiä pitkä").optional().nullable().default(null),
    content: z
      .string()
      .max(5000, "Sisältö saa olla enintään 5000 merkkiä pitkä")
      .transform((val) => (val === "" ? null : val))
      .optional()
      .nullable()
      .default(null),
    tags: z.array(z.string().max(30, "Tägin pituus saa olla enintään 30 merkkiä")).optional().default([]),
    pinned: z
      .preprocess(
        (val) => (typeof val === "string" ? (val === "false" ? false : true) : val),
        z.boolean("Valitse, ohitettiinko tankkaus")
      )
      .optional()
      .default(false),
  })
  .refine((data) => !!(data.title && data.title.trim()) || !!(data.content && data.content.trim()), {
    message: "Otsikko tai sisältö vaaditaan",
    path: ["title"], // or ["content"], or just [] for general error
  });

export type NoteSchemaType = z.infer<typeof NoteSchema>;
