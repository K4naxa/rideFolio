import { Injectable } from '@nestjs/common';
import { QuicklinkSchemaType } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { LimitsService } from 'src/limits/limits.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuicklinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly limitsService: LimitsService,
  ) {}

  getQuicklinksForUser(userSession: UserSession) {
    return this.prisma.quickLink.findMany({ where: { userId: userSession.user.id } });
  }

  async createQuickLink(userSession: UserSession, quickLink: QuicklinkSchemaType) {
    const sizeBytes = await this.limitsService.canCreateLog(userSession.user.id, userSession.user.id, quickLink);

    return await this.prisma.$transaction(async (tx) => {
      await this.limitsService.incrementStorageUsage(tx, userSession.user.id, 'QUICK_LINK', sizeBytes);
      return tx.quickLink.create({
        data: {
          userId: userSession.user.id,
          url: quickLink.url,
          name: quickLink.name,
          description: quickLink.description,
          sizeBytes,
        },
      });
    });
  }

  async deleteQuicklink(userSession: UserSession, id: string) {
    const quicklink = await this.prisma.quickLink.findUnique({ where: { id } });
    if (!quicklink) throw new Error('Quicklink not found');

    return await this.prisma.$transaction(async (tx) => {
      await this.limitsService.decrementStorageUsage(tx, userSession.user.id, 'QUICK_LINK', quicklink.sizeBytes);
      return tx.quickLink.delete({
        where: {
          userId: userSession.user.id,
          id: id,
        },
      });
    });
  }
}
