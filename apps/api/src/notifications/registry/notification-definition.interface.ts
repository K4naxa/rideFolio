export interface NotificationDefinition<TMeta = Record<string, unknown>> {
  type: string;
  requiresAction: boolean;
  defaultTitle: string;
  buildMessage: (meta: TMeta) => string;

  /** optional: which modal/action to trigger on the frontend */
  modalType?: string;
  /** optional: TTL in seconds */
  ttlSeconds?: number;
}
