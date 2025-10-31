import { z } from "zod";

export const RegisterSchema = z
  .object({
    name: z.string().min(1, { message: "Username required" }),
    email: z.email({ message: "Email has incorrect form" }),
    password: z.string().min(8, { message: "Password must be atleast 8 characters" }),
    image: z.string().nullable().optional(),
  })
  .refine((data) => data.password, {
    message: "Password required",
    path: ["password"],
  });

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.email({ message: "Incorrect Email" }),
  password: z.string().min(8, { message: "Incorrect password" }),
  rememberMe: z.boolean().optional(),
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;
