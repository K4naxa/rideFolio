import { NotificationMetaMap } from '@repo/validation';
import { NotificationDefinition } from '../registry/notification-definition.interface';

export const POOL_INVITE_NOTIFICATION: NotificationDefinition<'POOL_INVITE'> = {
  type: 'POOL_INVITE',
  requiresAction: true,
  modalType: 'poolInvite',
  defaultTitle: 'Group Invitation',
  ttlSeconds: 60 * 60 * 24 * 7, // 7 days
  buildMessage: (meta) => `You were invited to join "${meta.poolName}"`,
};

export const POOL_MEMBER_REMOVED_NOTIFICATION: NotificationDefinition<'POOL_MEMBER_REMOVED'> = {
  type: 'POOL_MEMBER_REMOVED',
  requiresAction: false,
  defaultTitle: 'Removed from Group',
  buildMessage: (meta) => `You have been removed from "${meta.poolName}"`,
};

export const POOL_ROLE_UPDATED_NOTIFICATION: NotificationDefinition<'POOL_ROLE_UPDATED'> = {
  type: 'POOL_ROLE_UPDATED',
  requiresAction: false,
  defaultTitle: 'Role Updated',
  buildMessage: (meta) => `Your role in "${meta.poolName}" changed to ${meta.newRole}`,
};

export const POOL_DISBANDED_NOTIFICATION: NotificationDefinition<'POOL_DISBANDED'> = {
  type: 'POOL_DISBANDED',
  requiresAction: false,
  defaultTitle: 'Group Disbanded',
  buildMessage: (meta) => `The group "${meta.poolName}" has been disbanded`,
};

export const POOL_VEHICLE_REMOVED_NOTIFICATION: NotificationDefinition<'POOL_VEHICLE_REMOVED'> = {
  type: 'POOL_VEHICLE_REMOVED',
  requiresAction: false,
  defaultTitle: 'Vehicle Removed',
  buildMessage: (meta) => `Your vehicle "${meta.vehicleName}" has been removed from the group "${meta.poolName}"`,
};

export const POOL_NOTIFICATIONS = [
  POOL_INVITE_NOTIFICATION,
  POOL_MEMBER_REMOVED_NOTIFICATION,
  POOL_ROLE_UPDATED_NOTIFICATION,
  POOL_DISBANDED_NOTIFICATION,
  POOL_VEHICLE_REMOVED_NOTIFICATION,
] as const satisfies readonly NotificationDefinition<keyof NotificationMetaMap>[];
