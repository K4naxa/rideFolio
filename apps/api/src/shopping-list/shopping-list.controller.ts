import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ShoppingItem, ShoppingItemValues, ShoppingListItemSchema } from '@repo/validation';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { ShoppingListService } from 'src/shopping-list/shopping-list.service';
import z, { ZodType } from 'zod';

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

  @Get()
  async getShoppinglistItems(@Session() userSession: UserSession) {
    return this.shoppingListService.getAllItems(userSession);
  }

  @Get(':vehicleId')
  async getItems(
    @Session() userSession: UserSession,
    @Param('vehicleId', new ZodValidationPipe(z.cuid())) vehicleId: string,
  ): Promise<ShoppingItem[]> {
    return await this.shoppingListService.getItemsForVehicle(userSession, vehicleId);
  }

  @Patch(':itemId/toggle')
  async togglePurchased(
    @Session() userSession: UserSession,
    @Param('itemId', new ZodValidationPipe(z.cuid())) itemId: string,
    @Body('isPurchased', new ZodValidationPipe(z.boolean())) isPurchased: boolean,
  ): Promise<ShoppingItem> {
    return await this.shoppingListService.toggleItemPurchased(userSession, itemId, isPurchased);
  }

  @Delete(':itemId')
  async deleteItem(
    @Session() userSession: UserSession,
    @Param('itemId', new ZodValidationPipe(z.cuid())) itemId: string,
  ): Promise<void> {
    await this.shoppingListService.deleteItem(userSession, itemId);
  }
}
