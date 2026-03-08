import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { VehicleAccessPrisma } from '../auth/vehicle-access.prisma';
import { VehicleTransformerService } from './vehicleTransformer.service';

@Injectable()
export class VehicleRepository {
  constructor(
    private prisma: PrismaService,
    private transformer: VehicleTransformerService,
  ) {}

  async findAccessibleVehicleIds(userId: string): Promise<string[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { ...VehicleAccessPrisma.forUser(userId) },
      select: {
        id: true,
      },
    });
    return vehicles.map((v) => v.id);
  }

  async findAccessibleVehicles(userId: string) {
    return this.prisma.vehicle.findMany({
      where: { ...VehicleAccessPrisma.forUser(userId) },
      include: this.transformer.DBInclude_BasicVehicleWithGroups(userId),
    });
  }
}
