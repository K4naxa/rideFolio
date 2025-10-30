import { Injectable } from '@nestjs/common';
import { ShoppingListItem, ShoppingListItemSchemaType } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';

@Injectable()
export class ShoppingListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authValidation: AuthValidationService,
  ) {}

  async createItem(userSession: UserSession, itemDto: ShoppingListItemSchemaType) {
    await this.authValidation.canCreateLogs(userSession.user.id, itemDto.vehicleId);

    await this.prisma.shoppingListItem.create({
      data: {
        vehicleId: itemDto.vehicleId,
        name: itemDto.name,
        price: itemDto.price,
        isPurchased: itemDto.isPurchased,
        createdById: userSession.user.id,
      },
    });
  }

  async getItemsForVehicle(userSession: UserSession, vehicleId: string): Promise<ShoppingListItem[]> {
    await this.authValidation.hasAccessToVehicle(userSession.user.id, vehicleId);

    const items = await this.prisma.shoppingListItem.findMany({
      where: { vehicleId },
      orderBy: [{ isPurchased: 'asc' }, { createdAt: 'desc' }],
    });

    return items;
  }

  async toggleItemPurchased(userSession: UserSession, itemId: string, isPurchased: boolean) {
    const item = await this.prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      include: { vehicle: { select: { id: true } } },
    });
    if (!item) {
      throw new Error('Shopping list item not found');
    }

    await this.authValidation.canEditLogs(userSession.user.id, item.vehicle.id);

    await this.prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        isPurchased,
        purchasedAt: isPurchased ? new Date() : null,
      },
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

    await this.authValidation.canDeleteLogs(userSession.user.id, item.vehicle.id);

    await this.prisma.shoppingListItem.delete({
      where: { id: itemId },
    });
  }

  async updateItem(userSession: UserSession, itemId: string, itemDto: ShoppingListItemSchemaType) {
    const item = await this.prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      include: { vehicle: { select: { id: true } } },
    });
    if (!item) {
      throw new Error('Shopping list item not found');
    }

    await this.authValidation.canEditLogs(userSession.user.id, item.vehicle.id);

    await this.prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        vehicleId: itemDto.vehicleId,
        name: itemDto.name,
        price: itemDto.price,
        isPurchased: itemDto.isPurchased,
      },
    });
  }
}
