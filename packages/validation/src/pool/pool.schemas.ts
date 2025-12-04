import * as z from "zod";
import { poolTypeCodes } from "./pool.types";

// Client-side form schema (what the form actually works with)
export const NewPoolFormSchema = z.object({
  name: z.string().min(1, "Required").max(50, "50 Character limit passed"),
  description: z.string().max(300, "300 Character limit passed").optional().nullable(),
  type: z.enum(poolTypeCodes, {
    message: "Pool type is required",
  }),
  vehicleIds: z.array(z.string()),

  // Boolean fields - no preprocessing needed for React Hook Form
  allowMembersToAddLogs: z.boolean(),
  allowMembersToEditLogs: z.boolean(),
  allowMembersToDeleteLogs: z.boolean(),
  allowMembersToAddVehicles: z.boolean(),
});

// Form types (for React Hook Form)
export type TNewPoolForm = z.infer<typeof NewPoolFormSchema>;

// Server-side schema (what gets sent to API and server)
export const NewPoolServerSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(999).optional(),
  type: z.enum(poolTypeCodes, {
    message: "Pool type is required",
  }),
  vehicleIds: z.array(z.string()).default([]),

  // Server might receive these as strings from FormData
  allowMembersToAddLogs: z.preprocess((val) => {
    if (typeof val === "string") return val === "true";
    if (typeof val === "boolean") return val;
    return Boolean(val);
  }, z.boolean()),
  allowMembersToEditLogs: z.preprocess((val) => {
    if (typeof val === "string") return val === "true";
    if (typeof val === "boolean") return val;
    return Boolean(val);
  }, z.boolean()),
  allowMembersToDeleteLogs: z.preprocess((val) => {
    if (typeof val === "string") return val === "true";
    if (typeof val === "boolean") return val;
    return Boolean(val);
  }, z.boolean()),
  allowMembersToAddVehicles: z.preprocess((val) => {
    if (typeof val === "string") return val === "true";
    if (typeof val === "boolean") return val;
    return Boolean(val);
  }, z.boolean()),
});

// 3. TYPE DEFINITIONS
// ===================

// Server types (for API and backend)
export type TNewPoolServerInput = z.input<typeof NewPoolServerSchema>;
export type TNewPoolServerOutput = z.output<typeof NewPoolServerSchema>;
