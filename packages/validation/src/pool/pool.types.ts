import { TBasicVehicle, TVehicleOwner } from "../vehicle";

// Pool types
export const POOL_TYPES = {
  PRIVATE: {
    code: "PRIVATE",
    label: "Private",
    icon: "userLock",
    nameKey: "pool.types.private.name",
    descriptionKey: "pool.types.private.description",
    description: "Only for your use, no other members",
  },
  SHARED: {
    code: "SHARED",
    label: "Shared",
    icon: "users",
    nameKey: "pool.types.shared.name",
    descriptionKey: "pool.types.shared.description",
    description: "Invite other users freely",
  },
};
export type PoolTypeCode = keyof typeof POOL_TYPES;
export const poolTypeCodes = Object.keys(POOL_TYPES) as PoolTypeCode[];
export function getPoolTypeNameKey(typeCode: PoolTypeCode): string {
  return POOL_TYPES[typeCode]?.label || "pool.types.unknown.name";
}
export function getPoolTypeIcon(typeCode: PoolTypeCode): string {
  return POOL_TYPES[typeCode]?.icon || "users";
}

// Pool member roles
export const POOL_MEMBER_ROLES = {
  OWNER: {
    code: "OWNER",
    label: "Owner",
    nameKey: "pool.memberRoles.owner",
    descriptionKey: "pool.memberRoles.ownerDescription",
    description: "Full access to the pool and its settings",
  },
  ADMIN: {
    code: "ADMIN",
    label: "Admin",
    nameKey: "pool.memberRoles.admin",
    descriptionKey: "pool.memberRoles.adminDescription",
    description: "Can manage members and settings",
  },
  MEMBER: {
    code: "MEMBER",
    label: "Member",
    nameKey: "pool.memberRoles.member",
    descriptionKey: "pool.memberRoles.memberDescription",
    description: "Can add and edit logs and vehicles",
  },
  VIEWER: {
    code: "VIEWER",
    label: "Viewer",
    nameKey: "pool.memberRoles.viewer",
    descriptionKey: "pool.memberRoles.viewerDescription",
    description: "Can view logs and vehicles",
  },
};
export type PoolMemberRoleCode = keyof typeof POOL_MEMBER_ROLES;
export const poolMemberRoleCodes = Object.keys(POOL_MEMBER_ROLES) as PoolMemberRoleCode[];

export type AccessiblePool = {
  id: string;
  type: PoolTypeCode;
  userRole: PoolMemberRoleCode;

  name: string;

  allowMembersToAddLogs: boolean;
  allowMembersToDeleteLogs: boolean;
  allowMembersToEditLogs: boolean;

  allowMembersToAddVehicles: boolean;
  vehicles: {
    id: string;
    name: string;
    image: string | null;
  }[];
};

export type TPoolInfo = {
  id: string;
  type: PoolTypeCode;
  userRole: PoolMemberRoleCode;

  name: string;
  description: string;

  allowMembersToAddLogs: boolean;
  allowMembersToDeleteLogs: boolean;
  allowMembersToEditLogs: boolean;

  allowMembersToAddVehicles: boolean;
};

export type TPoolMember = {
  role: PoolMemberRoleCode;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export type TPoolVehicle = {
  addedAt: Date;
  isOwnerUser: boolean;
  vehicleData: TBasicVehicle;
  owner: TVehicleOwner;
};
