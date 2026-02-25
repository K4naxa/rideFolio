import * as z from "zod";
import { poolMemberRoleCodes, poolTypeCodes } from "./pool.types";

export const PoolSchema = z.object({
  name: z.string().min(1, "Required").max(50, "50 Character limit passed"),
  description: z
    .string()
    .max(300, "300 Character limit passed")
    .optional()
    .nullable(),
  type: z.enum(poolTypeCodes, { message: "Pool type is required" }),
  vehicleIds: z.array(z.string()),

  membersCanAddLogs: z.preprocess(
    (val) =>
      typeof val === "string" ?
        val === "false" ?
          false
        : true
      : val,
    z.boolean("Invalid value"),
  ),
  membersCanEditLogs: z.preprocess(
    (val) =>
      typeof val === "string" ?
        val === "false" ?
          false
        : true
      : val,
    z.boolean("Invalid value"),
  ),
  membersCanDeleteLogs: z.preprocess(
    (val) =>
      typeof val === "string" ?
        val === "false" ?
          false
        : true
      : val,
    z.boolean("Invalid value"),
  ),
  membersCanAddVehicles: z.preprocess(
    (val) =>
      typeof val === "string" ?
        val === "false" ?
          false
        : true
      : val,
    z.boolean("Invalid value"),
  ),
});

export type PoolSchemaValues = z.infer<typeof PoolSchema>;

export const PoolInviteSchema = z.object({
  email: z.email("Invalid email address"),
  roleToGrant: z.enum(poolMemberRoleCodes, { message: "Role is required" }),
  poolId: z.cuid("Invalid pool ID"),
});
export type PoolInviteValues = z.infer<typeof PoolInviteSchema>;
export type PoolInviteInput = z.input<typeof PoolInviteSchema>;
