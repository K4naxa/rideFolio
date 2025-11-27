import { z } from "zod";

export const RegisterSchema = z
  .object({
    name: z.string().min(1, { message: "Username is required" }),
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
  email: z.email({ message: "Invalid email" }),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.email({ message: "Invalid email address" }),
});
export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters" }),
  revokeOtherSessions: z.preprocess(
    (val) => (typeof val === "string" ? (val === "false" ? false : true) : val),
    z.boolean("Invalid value")
  ),
});
export type PasswordUpdateValues = z.infer<typeof passwordUpdateSchema>;
