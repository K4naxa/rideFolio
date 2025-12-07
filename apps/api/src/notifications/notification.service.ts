import { Injectable } from '@nestjs/common';
import { PoolInvite } from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

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
        metadata: {
          poolId: poolInvite.poolId,
          poolName: poolInvite.pool.name,
          inviteId: poolInvite.id,
          sender: poolInvite.sender,
          roleToGrant: poolInvite.roleToGrant,
        },
      },
    });
  }
}
