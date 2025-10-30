import { TBasicVehicle, TVehicleOwner } from "../vehicle";

export type PoolTypes = "PRIVATE" | "SHARED" | "ASSIGNED";
export type PoolTypeOption = { value: PoolTypes; label: string };
export const PoolTypeValues = [
  { value: "PRIVATE" as const, label: "Yksityinen", message: "Vain sinun käyttöön" },
  { value: "SHARED" as const, label: "Jaettu", message: "Kutsu muita käyttäjiä vapaasti" },
  { value: "ASSIGNED" as const, label: "Määrätty", message: "Vain määrätyt käyttäjät" },
];

export const PoolMemberRoles = ["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const;
export type PoolMemberRole = (typeof PoolMemberRoles)[number];

export type AccessiblePool = {
  id: string;
  type: PoolTypes;
  userRole: PoolMemberRole;

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
  type: PoolTypes;
  userRole: PoolMemberRole;

  name: string;
  description: string;

  allowMembersToAddLogs: boolean;
  allowMembersToDeleteLogs: boolean;
  allowMembersToEditLogs: boolean;

  allowMembersToAddVehicles: boolean;
};

export type TPoolMember = {
  role: PoolMemberRole;
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
