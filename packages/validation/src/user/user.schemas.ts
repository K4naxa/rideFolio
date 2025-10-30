import { z } from "zod";

export const RegisterSchema = z
  .object({
    name: z.string().min(1, { message: "Anna Käyttäjänimi" }),
    email: z.email({ message: "Sähköpostin muoto on virheellinen." }),
    password: z.string().min(8, { message: "Salasanan tulee olla vähintään 8 merkkiä." }),
    image: z.string().nullable().optional(),
  })
  .refine((data) => data.password, {
    message: "Salasana on pakollinen.",
    path: ["password"],
  });

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.email({ message: "Sähköpostin muoto on virheellinen." }),
  password: z.string().min(8, { message: "Salasanan tulee olla vähintään 8 merkkiä." }),
  rememberMe: z.boolean().optional(),
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;
