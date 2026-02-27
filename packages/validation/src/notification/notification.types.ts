// Insert poolId to values that get automatically deleted when the pool is deleted
export interface PoolNotificationMeta {
  POOL_INVITE: {
    poolId: string;
    poolName: string;
    poolDescription: string | null;
    membersCanAddVehicles: boolean;
    inviteId: string;
    sender: { name: string; image: string | null };
    roleToGrant: string;
  };
  POOL_MEMBER_REMOVED: { poolName: string };
  POOL_ROLE_UPDATED: { poolId: string; poolName: string; newRole: string };
  POOL_VEHICLE_REMOVED: {
    poolId: string;
    poolName: string;
    vehicleName: string;
  };

  POOL_DISBANDED: {
    poolName: string;
  };
}

// Merge all notification meta-types into a single map
export type NotificationMetaMap = PoolNotificationMeta;
// All notification types variable keys of the meta-map
export type NotificationType = keyof NotificationMetaMap;

export interface Notification<T extends NotificationType = NotificationType> {
  id: string;
  type: T;
  title: string;
  message: string;
  requiresAction: boolean;
  metadata: NotificationMetaMap[T];
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  expiresAt: string | null;
  userId: string;
}

// TYPE guard utility for getting typed metadata in frontend components
export function isNotificationType<T extends NotificationType>(
  n: Notification,
  type: T,
): n is Notification<T> {
  return n.type === type;
}
