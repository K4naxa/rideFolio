import { Test, TestingModule } from '@nestjs/testing';
import { QuicklinksService } from './quicklinks.service';

describe('QuicklinksService', () => {
  let service: QuicklinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuicklinksService],
    }).compile();

    service = module.get<QuicklinksService>(QuicklinksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
