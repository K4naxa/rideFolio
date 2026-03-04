import { NotificationMetaMap } from '@repo/validation';
import { NotificationDefinition } from '../registry/notification-definition.interface';

export const GROUP_INVITE_NOTIFICATION: NotificationDefinition<'GROUP_INVITE'> = {
  type: 'GROUP_INVITE',
  requiresAction: true,
  modalType: 'groupInvite',
  defaultTitle: 'Group Invitation',
  ttlSeconds: 60 * 60 * 24 * 7, // 7 days
  buildMessage: (meta) => `You were invited to join "${meta.groupName}"`,
};

export const GROUP_MEMBER_REMOVED_NOTIFICATION: NotificationDefinition<'GROUP_MEMBER_REMOVED'> = {
  type: 'GROUP_MEMBER_REMOVED',
  requiresAction: false,
  defaultTitle: 'Removed from Group',
  buildMessage: (meta) => `You have been removed from "${meta.groupName}"`,
};

export const GROUP_ROLE_UPDATED_NOTIFICATION: NotificationDefinition<'GROUP_ROLE_UPDATED'> = {
  type: 'GROUP_ROLE_UPDATED',
  requiresAction: false,
  defaultTitle: 'Role Updated',
  buildMessage: (meta) => `Your role in "${meta.groupName}" changed to ${meta.newRole}`,
};

export const GROUP_DISBANDED_NOTIFICATION: NotificationDefinition<'GROUP_DISBANDED'> = {
  type: 'GROUP_DISBANDED',
  requiresAction: false,
  defaultTitle: 'Group Disbanded',
  buildMessage: (meta) => `The group "${meta.groupName}" has been disbanded`,
};

export const GROUP_VEHICLE_REMOVED_NOTIFICATION: NotificationDefinition<'GROUP_VEHICLE_REMOVED'> = {
  type: 'GROUP_VEHICLE_REMOVED',
  requiresAction: false,
  defaultTitle: 'Vehicle Removed',
  buildMessage: (meta) => `Your vehicle "${meta.vehicleName}" has been removed from the group "${meta.groupName}"`,
};

export const GROUP_NOTIFICATIONS = [
  GROUP_INVITE_NOTIFICATION,
  GROUP_MEMBER_REMOVED_NOTIFICATION,
  GROUP_ROLE_UPDATED_NOTIFICATION,
  GROUP_DISBANDED_NOTIFICATION,
  GROUP_VEHICLE_REMOVED_NOTIFICATION,
] as const satisfies readonly NotificationDefinition<keyof NotificationMetaMap>[];
