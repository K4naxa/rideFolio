import { Injectable } from '@nestjs/common';
import { ShoppingItem, ShoppingItemValues, ShoppingListDB_Select } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { LimitsService } from 'src/limits/limits.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';

@Injectable()
export class ShoppingListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authValidation: AuthValidationService,
    private readonly limitsService: LimitsService,
  ) {}

  async createItem(userSession: UserSession, itemDto: ShoppingItemValues): Promise<ShoppingItem> {
    const vehicle = await this.authValidation.canCreateLogs(userSession.user.id, itemDto.vehicleId);
    const sizeBytes = await this.limitsService.canCreateLog(userSession.user.id, vehicle.ownerId, itemDto);

    return await this.prisma.$transaction(async (tx) => {
      await this.limitsService.incrementStorageUsage(tx, vehicle.ownerId, 'SHOPPING_LIST', sizeBytes);
      return await tx.shoppingListItem.create({
        data: {
          ...itemDto,
          createdById: userSession.user.id,
          sizeBytes,
        },
        select: ShoppingListDB_Select,
      });
    });
  }

  async getItemsForVehicle(userSession: UserSession, vehicleId: string): Promise<ShoppingItem[]> {
    await this.authValidation.hasAccessToVehicle(userSession.user.id, vehicleId);

    const items = await this.prisma.shoppingListItem.findMany({
      where: { vehicleId },
      select: ShoppingListDB_Select,
      orderBy: { createdAt: 'asc' },
    });

    return items;
  }

  async toggleItemPurchased(userSession: UserSession, itemId: string, isPurchased: boolean): Promise<ShoppingItem> {
    const item = await this.prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      select: { vehicle: { select: { id: true } } },
    });
    if (!item) throw new Error('Shopping list item not found');

    await this.authValidation.canEditLogs(userSession.user.id, item.vehicle.id);

    return await this.prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        isPurchased,
        purchasedAt: isPurchased ? new Date() : null,
      },
      select: ShoppingListDB_Select,
    });
  }

  async deleteItem(userSession: UserSession, itemId: string) {
    const item = await this.prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      include: { vehicle: { select: { id: true } } },
    });
    if (!item) {
      throw new Error('Shopping list item not found');
    }

    const vehicle = await this.authValidation.canDeleteLogs(userSession.user.id, item.vehicle.id);

    await this.prisma.$transaction(async (tx) => {
      await this.limitsService.decrementStorageUsage(tx, vehicle.ownerId, 'SHOPPING_LIST', item.sizeBytes);
      await tx.shoppingListItem.delete({ where: { id: itemId } });
    });
  }
}
