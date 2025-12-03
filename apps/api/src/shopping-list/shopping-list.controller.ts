import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ShoppingListItemSchema, ShoppingItemValues, ShoppingItem } from '@repo/validation';
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
    @Body(new ZodValidationPipe(ShoppingListItemSchema as ZodType)) itemDto: ShoppingItemValues,
  ): Promise<ShoppingItem> {
    return await this.shoppingListService.createItem(userSession, itemDto);
  }

  @Get(':vehicleId')
  async getItems(@Session() userSession: UserSession, @Param('vehicleId') vehicleId: string): Promise<ShoppingItem[]> {
    return await this.shoppingListService.getItemsForVehicle(userSession, vehicleId);
  }

  @Patch(':itemId/toggle')
  async togglePurchased(
    @Session() userSession: UserSession,
    @Param('itemId') itemId: string,
    @Body() body: { isPurchased: boolean },
  ): Promise<ShoppingItem> {
    return await this.shoppingListService.toggleItemPurchased(userSession, itemId, body.isPurchased);
  }

  @Delete(':itemId')
  async deleteItem(@Session() userSession: UserSession, @Param('itemId') itemId: string): Promise<void> {
    await this.shoppingListService.deleteItem(userSession, itemId);
  }

  @Put(':itemId')
  async updateItem(
    @Session() userSession: UserSession,
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(ShoppingListItemSchema as ZodType)) itemDto: ShoppingItemValues,
  ): Promise<ShoppingItem> {
    return await this.shoppingListService.updateItem(userSession, itemId, itemDto);
  }
}
