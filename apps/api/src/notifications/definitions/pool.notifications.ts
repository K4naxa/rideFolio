import { NotificationMetaMap, PoolMemberRoleCode } from '@repo/validation';
import { NotificationDefinition } from '../registry/notification-definition.interface';

export const POOL_INVITE_NOTIFICATION: NotificationDefinition<NotificationMetaMap['POOL_INVITE']> = {
  type: 'POOL_INVITE',
  requiresAction: true,
  modalType: 'poolInvite',
  defaultTitle: 'Group Invitation',
  ttlSeconds: 60 * 60 * 24 * 7, // 7 days
  buildMessage: (meta) => `You were invited to join "${meta.poolName}"`,
};

export const POOL_MEMBER_REMOVED_NOTIFICATION: NotificationDefinition<{ poolName: string }> = {
  type: 'POOL_MEMBER_REMOVED',
  requiresAction: false,
  defaultTitle: 'Removed from Group',
  buildMessage: (meta) => `You have been removed from "${meta.poolName}"`,
};

export const POOL_ROLE_CHANGED_NOTIFICATION: NotificationDefinition<{
  poolName: string;
  newRole: PoolMemberRoleCode;
}> = {
  type: 'POOL_YOUR_ROLE_CHANGED',
  requiresAction: false,
  defaultTitle: 'Role Updated',
  buildMessage: (meta) => `Your role in "${meta.poolName}" changed to ${meta.newRole}`,
};

export const POOL_NOTIFICATIONS = [
  POOL_INVITE_NOTIFICATION,
  POOL_MEMBER_REMOVED_NOTIFICATION,
  POOL_ROLE_CHANGED_NOTIFICATION,
];
