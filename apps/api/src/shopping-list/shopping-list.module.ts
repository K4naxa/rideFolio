import { Module } from '@nestjs/common';
import { ShoppingListController } from './shopping-list.controller';
import { ShoppingListService } from './shopping-list.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ShoppingListController],
  providers: [ShoppingListService, AuthValidationService, PrismaService],
  exports: [ShoppingListService],
})
export class ShoppingListModule {}
