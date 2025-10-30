import { Controller, Get, Param, Query } from '@nestjs/common';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { StatisticsService } from 'src/statistics/statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('vehicle/month/:id')
  async getVehicleStatistics(
    @Session() userSession: UserSession,
    @Param('id') id: string,
    @Query('month') month,
    @Query('year') year,
  ) {
    const formattedMonth = parseInt(month as string, 10);
    const formattedYear = parseInt(year as string, 10);
    return await this.statisticsService.findVehicleMonthlyStats(userSession, id, formattedMonth, formattedYear);
  }
}
