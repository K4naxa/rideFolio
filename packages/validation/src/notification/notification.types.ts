import { PoolMemberRoleCode } from "../pool";

export type NotificationModalType = "poolInvite";

export const NOTIFICATION_TYPES = [
  "POOL_INVITE",
  "POOL_INVITE_ACCEPTED",
  "POOL_INVITE_DECLINED",
  "POOL_MEMBER_LEFT",
  "POOL_YOUR_ROLE_CHANGED",
  "POOL_YOUR_VEHICLE_REMOVED",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

interface NotificationHandler {
  modalType?: NotificationModalType;
  requiresAction: boolean;
  onClick?: (notification: Notification, modalStore: any) => void;
}

export const NOTIFICATION_HANDLERS: Record<NotificationType, NotificationHandler> = {
  POOL_INVITE: { modalType: "poolInvite", requiresAction: true },
  POOL_INVITE_ACCEPTED: { requiresAction: false },
  POOL_INVITE_DECLINED: { requiresAction: false },
  POOL_MEMBER_LEFT: { requiresAction: false },
  POOL_YOUR_ROLE_CHANGED: { requiresAction: false },
  POOL_YOUR_VEHICLE_REMOVED: { requiresAction: false },
};

interface BaseNotification {
  id: string;
  title: string;
  message: string;
  requiresAction: boolean;
  isRead: boolean;
  createdAt: string;
  expireAt: string;
}

export interface PoolInviteNotification extends BaseNotification {
  type: "POOL_INVITE";
  metadata: {
    poolId: string;
    poolName: string;
    poolDescription: string | null;
    poolMemberCount: number;
    poolVehicleCount: number;
    inviteId: string;
    sender: {
      name: string;
      image: string | null;
    };
    roleToGrant: PoolMemberRoleCode;
  };
}

export interface PoolInviteResponseNotification extends BaseNotification {
  type: "POOL_INVITE_ACCEPTED" | "POOL_INVITE_DECLINED";
  metadata: {
    poolId: string;
    poolName: string;
    responder: {
      name: string;
      image: string | null;
    };
  };
}

export type Notification = PoolInviteNotification | PoolInviteResponseNotification;
