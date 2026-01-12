import { z } from "zod";

export const QuicklinkSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "50 Character limit passed").trim(),
  url: z
    .string()
    .transform((val) => {
      if (!/^https?:\/\//i.test(val)) {
        return `https://${val}`;
      }
      return val;
    })
    .pipe(z.url().trim()),
  description: z.string().max(200, "200 Character limit passed").optional().nullable(),
});

export type QuicklinkSchemaType = z.infer<typeof QuicklinkSchema>;
