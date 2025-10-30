import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ShoppingListItemSchema, ShoppingListItemSchemaType } from '@repo/validation';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { ShoppingListService } from 'src/shopping-list/shopping-list.service';
import { ZodType } from 'zod';

@Controller('shopping-list')
export class ShoppingListController {
  constructor(private shoppingListService: ShoppingListService) {}

  @Post()
  async createItem(
    @Session() userSession: UserSession,
    @Body(new ZodValidationPipe(ShoppingListItemSchema as ZodType)) itemDto: ShoppingListItemSchemaType,
  ) {
    await this.shoppingListService.createItem(userSession, itemDto);
    return { status: 'success' };
  }

  @Get(':vehicleId')
  async getItems(@Session() userSession: UserSession, @Param('vehicleId') vehicleId: string) {
    return await this.shoppingListService.getItemsForVehicle(userSession, vehicleId);
  }

  @Post(':itemId/toggle')
  async togglePurchased(
    @Session() userSession: UserSession,
    @Param('itemId') itemId: string,
    @Body() body: { isPurchased: boolean },
  ) {
    await this.shoppingListService.toggleItemPurchased(userSession, itemId, body.isPurchased);
    return { status: 'success' };
  }

  @Delete(':itemId')
  async deleteItem(@Session() userSession: UserSession, @Param('itemId') itemId: string) {
    await this.shoppingListService.deleteItem(userSession, itemId);
    return { status: 'success' };
  }

  @Post(':itemId')
  async updateItem(
    @Session() userSession: UserSession,
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(ShoppingListItemSchema as ZodType)) itemDto: ShoppingListItemSchemaType,
  ) {
    await this.shoppingListService.updateItem(userSession, itemId, itemDto);
    return { status: 'success' };
  }
}
