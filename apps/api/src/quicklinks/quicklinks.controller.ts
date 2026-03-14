import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Quicklink, QuicklinkSchema, QuicklinkSchemaType } from '@repo/validation';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { QuicklinksService } from 'src/quicklinks/quicklinks.service';
import z, { ZodType } from 'zod';

@Controller('quicklinks')
export class QuicklinksController {
  constructor(private readonly quicklinksService: QuicklinksService) {}

  @Get()
  getUsersQuicklinks(@Session() userSession: UserSession): Promise<Quicklink[]> {
    return this.quicklinksService.getQuicklinksForUser(userSession);
  }

  @Post()
  createQuicklink(
    @Session() userSession: UserSession,
    @Body(new ZodValidationPipe(QuicklinkSchema as ZodType)) quickLinkDto: QuicklinkSchemaType,
  ): Promise<Quicklink> {
    return this.quicklinksService.createQuickLink(userSession, quickLinkDto);
  }

  @Delete(':id')
  deleteQuicklink(@Session() userSession: UserSession, @Param('id', new ZodValidationPipe(z.cuid())) id: string) {
    return this.quicklinksService.deleteQuicklink(userSession, id);
  }
}
