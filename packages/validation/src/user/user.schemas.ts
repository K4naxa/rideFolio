import { z } from "zod";
import { consumptionUnitCodes_distance, consumptionUnitCodes_hour, currencyCodes, volumeUnitCodes } from "./user.types";
import { odometerTypeCodes } from "../vehicle";

export const nameSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Username is required" })
    .max(30, { message: "Username must be at most 30 characters" }),
});
export const RegisterSchema = z
  .object({
    name: nameSchema.shape.name,
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

export const passwordUpdateSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z.string().min(8, { message: "New password must be at least 8 characters" }),
    newPasswordConfirmation: z.string().min(1, { message: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "New password and confirmation do not match",
    path: ["newPasswordConfirmation", "newPassword"],
  })
  .extend({
    revokeOtherSessions: z.preprocess(
      (val) => (typeof val === "string" ? (val === "false" ? false : true) : val),
      z.boolean("Invalid value"),
    ),
  });
export type PasswordUpdateValues = z.infer<typeof passwordUpdateSchema>;

export const UpdatePreferenceSchema = z.discriminatedUnion("key", [
  z.object({
    key: z.literal("odometerType"),
    value: z.enum(odometerTypeCodes, {
      message: "Invalid odometer type",
    }),
  }),
  z.object({
    key: z.literal("volumeUnit"),
    value: z.enum(volumeUnitCodes, {
      message: "Invalid volume unit",
    }),
  }),
  z.object({
    key: z.literal("currency"),
    value: z.enum(
      currencyCodes.map((v) => v),
      {
        message: "Invalid currency type",
      },
    ),
  }),
  z.object({
    key: z.literal("consumptionUnitCode_distance"),
    value: z.enum(consumptionUnitCodes_distance, {
      message: "Invalid consumption unit",
    }),
  }),
  z.object({
    key: z.literal("consumptionUnitCode_hour"),
    value: z.enum(consumptionUnitCodes_hour, {
      message: "Invalid consumption unit",
    }),
  }),
]);
export type UpdatePreferenceValues = z.infer<typeof UpdatePreferenceSchema>;
