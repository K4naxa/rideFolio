import { Injectable } from '@nestjs/common';
import type { NotificationType } from '@repo/validation';
import { NotificationDefinition } from './notification-definition.interface';

@Injectable()
export class NotificationRegistry {
  private readonly definitions = new Map<NotificationType, NotificationDefinition>();

  register<TType extends NotificationType>(definition: NotificationDefinition<TType>): void {
    this.definitions.set(definition.type, definition as NotificationDefinition);
  }

  get(type: NotificationType): NotificationDefinition {
    const def = this.definitions.get(type);
    if (!def) throw new Error(`Unknown notification type: ${type}`);

    return def;
  }

  has(type: NotificationType): boolean {
    return this.definitions.has(type);
  }
}
