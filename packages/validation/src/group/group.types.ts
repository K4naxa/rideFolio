import { BasicVehicle, TVehicleOwner } from "../vehicle";

// Group member roles
export const GROUP_MEMBER_ROLES = {
  OWNER: {
    code: "OWNER",
    label: "Owner",
    nameKey: "group.memberRoles.owner",
    descriptionKey: "group.memberRoles.ownerDescription",
    description: "Full access to the group and its settings",
  },
  ADMIN: {
    code: "ADMIN",
    label: "Admin",
    nameKey: "group.memberRoles.admin",
    descriptionKey: "group.memberRoles.adminDescription",
    description: "Can manage members and settings",
  },
  MEMBER: {
    code: "MEMBER",
    label: "Member",
    nameKey: "group.memberRoles.member",
    descriptionKey: "group.memberRoles.memberDescription",
    description: "Can add and edit logs and vehicles",
  },
};
export type GroupMemberRoleCode = keyof typeof GROUP_MEMBER_ROLES;
export const groupMemberRoleCodes = Object.keys(
  GROUP_MEMBER_ROLES,
) as GroupMemberRoleCode[];
export function getGroupMemberRoleNameKey(
  roleCode: GroupMemberRoleCode,
): string {
  return GROUP_MEMBER_ROLES[roleCode]?.label || "group.memberRoles.unknown";
}

export const GROUP_INVITE_STATES = {
  PENDING: {
    code: "PENDING",
    label: "Pending",
    nameKey: "group.inviteStates.pending",
  },
  ACCEPTED: {
    code: "ACCEPTED",
    label: "Accepted",
    nameKey: "group.inviteStates.accepted",
  },
  DECLINED: {
    code: "DECLINED",
    label: "Declined",
    nameKey: "group.inviteStates.declined",
  },
};
export type GroupInviteStateCode = keyof typeof GROUP_INVITE_STATES;
export const groupInviteStateCodes = Object.keys(
  GROUP_INVITE_STATES,
) as GroupInviteStateCode[];
export function getGroupInviteStateNameKey(
  stateCode: GroupInviteStateCode,
): string {
  return GROUP_INVITE_STATES[stateCode]?.label || "group.inviteStates.unknown";
}

// Data types

export type AccessibleGroup = { id: string; name: string };

export type GroupDetails = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  userRole: GroupMemberRoleCode;

  rules: {
    membersCanAddLogs: boolean;
    membersCanAddVehicles: boolean;
    membersCanEditLogs: boolean;
    membersCanDeleteLogs: boolean;
  };

  members: GroupMember[];
  invites?: GroupInvites[];
  vehicles: GroupVehicle[];
};

export type GroupInvites = {
  id: string;
  email: string;
  roleToGrant: GroupMemberRoleCode;
  state: GroupInviteStateCode;
  createdAt: Date;
};

export type GroupMember = {
  role: GroupMemberRoleCode;
  createdAt: Date;
  user: { id: string; name: string; email?: string; image: string | null };
};

export type GroupVehicle = {
  addedAt: Date;
  isCurrentUserOwner: boolean;
  data: BasicVehicle;
  owner: TVehicleOwner;
};
