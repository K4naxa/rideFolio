import { Test, TestingModule } from '@nestjs/testing';
import { QuicklinksController } from './quicklinks.controller';

describe('QuicklinksController', () => {
  let controller: QuicklinksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuicklinksController],
    }).compile();

    controller = module.get<QuicklinksController>(QuicklinksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
