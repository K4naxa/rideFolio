import { Controller } from '@nestjs/common';
import { StatisticsService } from 'src/statistics/statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}
}
