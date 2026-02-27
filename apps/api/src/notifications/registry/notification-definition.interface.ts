import type { NotificationMetaMap, NotificationType } from '@repo/validation';

export interface NotificationDefinition<TType extends NotificationType = NotificationType> {
  type: TType;
  requiresAction: boolean;
  defaultTitle: string;
  buildMessage: (meta: NotificationMetaMap[TType]) => string;

  /** optional: which modal/action to trigger on the frontend */
  modalType?: string;
  /** optional: TTL in seconds */
  ttlSeconds?: number;
}
