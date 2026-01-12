import { Injectable } from '@nestjs/common';
import { QuicklinkSchemaType } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuicklinksService {
  constructor(private readonly prisma: PrismaService) {}

  getQuicklinksForUser(userSession: UserSession) {
    return this.prisma.quickLink.findMany({ where: { userId: userSession.user.id } });
  }

  createQuickLink(userSession: UserSession, quickLink: QuicklinkSchemaType) {
    return this.prisma.quickLink.create({
      data: {
        userId: userSession.user.id,
        url: quickLink.url,
        name: quickLink.name,
        description: quickLink.description,
      },
    });
  }

  deleteQuicklink(userSession: UserSession, id: string) {
    return this.prisma.quickLink.delete({
      where: {
        userId: userSession.user.id,
        id: id,
      },
    });
  }
}
