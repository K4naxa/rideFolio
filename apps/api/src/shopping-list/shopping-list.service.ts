import { Injectable } from '@nestjs/common';
import { AppNotFoundException } from 'src/exceptions';
import { ShoppingItem, ShoppingItemValues, ShoppingListDB_Select } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { LimitsService } from 'src/limits/limits.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { VehicleAccessPrisma } from '../auth/vehicle-access.prisma';

@Injectable()
export class ShoppingListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authValidation: AuthValidationService,
    private readonly limitsService: LimitsService,
  ) {}

  async createItem(userSession: UserSession, itemDto: ShoppingItemValues): Promise<ShoppingItem> {
    const vehicle = await this.authValidation.hasAccessToVehicle(userSession.user.id, itemDto.vehicleId);
    const sizeBytes = await this.limitsService.canCreateLog(userSession.user.id, vehicle.ownerId, itemDto);

    return await this.prisma.$transaction(async (tx) => {
      await this.limitsService.incrementStorageUsage(tx, vehicle.ownerId, 'SHOPPING_LIST', sizeBytes);
      return tx.shoppingListItem.create({
        data: {
          ...itemDto,
          createdById: userSession.user.id,
          sizeBytes,
        },
        select: ShoppingListDB_Select,
      });
    });
  }

  async getAllItems(userSession: UserSession): Promise<ShoppingItem[]> {
    return this.prisma.shoppingListItem.findMany({
      where: { ...VehicleAccessPrisma.nestedForUser(userSession.user.id) },
      select: ShoppingListDB_Select,
      orderBy: { createdAt: 'asc' },
    });
  }

  async getItemsForVehicle(userSession: UserSession, vehicleId: string): Promise<ShoppingItem[]> {
    await this.authValidation.hasAccessToVehicle(userSession.user.id, vehicleId);

    return this.prisma.shoppingListItem.findMany({
      where: { vehicleId },
      select: ShoppingListDB_Select,
      orderBy: { createdAt: 'asc' },
    });
  }

  async toggleItemPurchased(userSession: UserSession, itemId: string, isPurchased: boolean): Promise<ShoppingItem> {
    const result = await this.prisma.shoppingListItem.update({
      where: { id: itemId, ...VehicleAccessPrisma.nestedForUser(userSession.user.id) },
      data: {
        isPurchased,
        purchasedAt: isPurchased ? new Date() : null,
      },
      select: ShoppingListDB_Select,
    });

    if (!result) throw new AppNotFoundException();

    return result;
  }

  async deleteItem(userSession: UserSession, itemId: string) {
    const item = await this.prisma.shoppingListItem.findUnique({
      where: { id: itemId, ...VehicleAccessPrisma.nestedForUser(userSession.user.id) },
      include: { vehicle: { select: { ownerId: true } } },
    });
    if (!item) throw new AppNotFoundException();

    await this.prisma.$transaction(async (tx) => {
      await this.limitsService.decrementStorageUsage(tx, item.vehicle.ownerId, 'SHOPPING_LIST', item.sizeBytes);
      await tx.shoppingListItem.delete({ where: { id: item.id } });
    });
  }
}
