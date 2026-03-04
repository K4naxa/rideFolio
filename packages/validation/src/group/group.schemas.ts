import * as z from "zod";
import { groupMemberRoleCodes, groupTypeCodes } from "./group.types";

export const GroupSchema = z.object({
  name: z.string().min(1, "Required").max(50, "50 Character limit passed"),
  description: z
    .string()
    .max(300, "300 Character limit passed")
    .optional()
    .nullable(),
  vehicleIds: z.array(z.string()),
  membersCanAddLogs: z.preprocess(
    (val) => (typeof val === "string" ? val !== "false" : val),
    z.boolean("Invalid value"),
  ),
  membersCanEditLogs: z.preprocess(
    (val) => (typeof val === "string" ? val !== "false" : val),
    z.boolean("Invalid value"),
  ),
  membersCanDeleteLogs: z.preprocess(
    (val) => (typeof val === "string" ? val !== "false" : val),
    z.boolean("Invalid value"),
  ),
  membersCanAddVehicles: z.preprocess(
    (val) => (typeof val === "string" ? val !== "false" : val),
    z.boolean("Invalid value"),
  ),
});

export type GroupSchemaValues = z.infer<typeof GroupSchema>;

export const GroupInviteSchema = z.object({
  email: z.email("Invalid email address"),
  roleToGrant: z.enum(groupMemberRoleCodes, { message: "Role is required" }),
  groupId: z.cuid("Invalid group ID"),
});
export type GroupInviteValues = z.infer<typeof GroupInviteSchema>;
export type GroupInviteInput = z.input<typeof GroupInviteSchema>;
