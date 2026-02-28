import { Controller, Get, Query } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { TimelineQueryInput, TimelineQuerySchema } from '@repo/validation';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { ZodType } from 'zod';

@Controller('timeline')
export class TimelineController {
  constructor(private timelineService: TimelineService) {}

  @Get()
  async getTimeline(
    @Session() session: UserSession,
    @Query(new ZodValidationPipe(TimelineQuerySchema as ZodType))
    query: TimelineQueryInput,
  ) {
    return await this.timelineService.getTimeline(session, query);
  }
}
