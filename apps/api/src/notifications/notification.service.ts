import { Injectable } from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { Prisma } from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationRegistry } from './registry/notification.registry';
import type { NotificationMetaMap, NotificationType } from '@repo/validation';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: NotificationRegistry,
  ) {}

  async create<TType extends NotificationType>(params: {
    type: TType;
    userId: string;
    meta: NotificationMetaMap[TType];
    overrides?: { title?: string; message?: string; requiresAction?: boolean };
    transactionClient?: Prisma.TransactionClient;
  }): Promise<void> {
    const def = this.registry.get(params.type);
    const message = params.overrides?.message ?? def.buildMessage(params.meta);
    const title = params.overrides?.title ?? def.defaultTitle;
    const requiresAction = params.overrides?.requiresAction ?? def.requiresAction;
    const expiresAt = def.ttlSeconds ? new Date(Date.now() + def.ttlSeconds * 1000) : null;

    if (params.transactionClient) {
      await params.transactionClient.notification.create({
        data: {
          type: def.type,
          userId: params.userId,
          title,
          message,
          requiresAction,
          expiresAt,
          metadata: params.meta as Prisma.InputJsonValue,
        },
      });
    } else {
      await this.prisma.notification.create({
        data: {
          type: def.type,
          userId: params.userId,
          title,
          message,
          requiresAction,
          expiresAt,
          metadata: params.meta as Prisma.InputJsonValue,
        },
      });
    }

    // Future: emit event handler here to push real-time updates to the user via WebSocket or similar
  }

  async getUserNotifications(userSession: UserSession) {
    return this.prisma.notification.findMany({
      where: {
        userId: userSession.user.id,
        isRead: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(userSession: UserSession, notificationId: string) {
    await this.prisma.notification.update({
      where: { id: notificationId, userId: userSession.user.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}
