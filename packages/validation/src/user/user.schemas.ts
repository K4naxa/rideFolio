import { z } from "zod";

export const CreateUserSchema = z
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

export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>;

export const LoginUserSchema = z.object({
  email: z.email({ message: "Sähköpostin muoto on virheellinen." }),
  password: z.string().min(8, { message: "Salasanan tulee olla vähintään 8 merkkiä." }),
  rememberMe: z.boolean().optional(),
});
export type LoginUserSchemaType = z.infer<typeof LoginUserSchema>;
