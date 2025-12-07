import { Injectable } from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PoolInvite } from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserNotifications(userSession: UserSession) {
    return await this.prisma.notification.findMany({
      where: { userId: userSession.user.id, isRead: false },
    });
  }

  async markNotificationAsRead(userSession: UserSession, notificationId: string) {
    await this.prisma.notification.update({
      where: { id: notificationId, userId: userSession.user.id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async createPoolInviteNotification(
    poolInvite: PoolInvite & {
      sender: { name: string; image: string | null };
      pool: { name: string; description: string | null; _count: { members: number; vehicles: number } };
    },
  ): Promise<void> {
    await this.prisma.notification.create({
      data: {
        type: 'POOL_INVITE',
        userId: poolInvite.receiverId,
        title: 'You have been invited to a pool',
        message: 'You have a new pool invitation to: ' + poolInvite.pool.name,
        requiresAction: true,
        metadata: {
          poolId: poolInvite.poolId,
          poolName: poolInvite.pool.name,
          poolDescription: poolInvite.pool.description,
          poolMemberCount: poolInvite.pool._count.members,
          poolVehicleCount: poolInvite.pool._count.vehicles,
          inviteId: poolInvite.id,
          sender: poolInvite.sender,
          roleToGrant: poolInvite.roleToGrant,
        },
      },
    });
  }
}
