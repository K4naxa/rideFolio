import { Injectable } from '@nestjs/common';
import { NotificationDefinition } from './notification-definition.interface';

@Injectable()
export class NotificationRegistry {
  private readonly definitions = new Map<string, NotificationDefinition>();

  register<T>(definition: NotificationDefinition<T>): void {
    this.definitions.set(definition.type, definition as NotificationDefinition);
  }

  get(type: string): NotificationDefinition {
    const def = this.definitions.get(type);
    if (!def) throw new Error(`Unknown notification type: ${type}`);

    return def;
  }

  has(type: string): boolean {
    return this.definitions.has(type);
  }
}
