// Insert groupId to values that get automatically deleted when the group is deleted
export interface GroupNotificationMeta {
  GROUP_INVITE: {
    groupId: string;
    groupName: string;
    groupDescription: string | null;
    membersCanAddVehicles: boolean;
    inviteId: string;
    sender: { name: string; image: string | null };
    roleToGrant: string;
  };
  GROUP_MEMBER_REMOVED: { groupName: string };
  GROUP_ROLE_UPDATED: { groupId: string; groupName: string; newRole: string };
  GROUP_VEHICLE_REMOVED: {
    groupId: string;
    groupName: string;
    vehicleName: string;
  };

  GROUP_DISBANDED: {
    groupName: string;
  };
}

// Merge all notification meta-types into a single map
export type NotificationMetaMap = GroupNotificationMeta;
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
