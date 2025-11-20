import { Injectable } from '@nestjs/common';
import { RecentActivityQueryOptions } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { VehicleRepository } from 'src/utils/vehicleRepository';

@Injectable()
export class LogsService {
  constructor(
    private prisma: PrismaService,
    private vehicleRepository: VehicleRepository,
    private authValidation: AuthValidationService,
    private unitConversion: UnitConversionService,
  ) {}

  private async getVehicleIdsAndName(
    options: RecentActivityQueryOptions,
    UserSession: UserSession,
  ): Promise<{ vehicleIds: string[]; name: string | null }> {
    const { vehicleId, poolId, owned } = options;
    let name: string | null = null;
    let targetVehicleIds: string[] = [];

    console.log('owned value:', owned, 'type:', typeof owned);

    if (vehicleId) {
      await this.authValidation.hasAccessToVehicle(UserSession.user.id, vehicleId);
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { name: true } });
      name = vehicle?.name || null;
      return { vehicleIds: [vehicleId], name: name };
    }
    // pool id provided
    else if (poolId) {
      await this.authValidation.hasAccessToPool(UserSession.user.id, poolId);
      const [poolVehicles, pool] = await Promise.all([
        this.vehicleRepository.findPoolVehicles(poolId),
        this.prisma.pool.findUnique({ where: { id: poolId }, select: { name: true } }),
      ]);
      name = pool?.name || null;
      targetVehicleIds = poolVehicles.map((pv) => pv.vehicle.id);
      return { vehicleIds: targetVehicleIds, name: name };
    }
    // owned vehicles
    else if (owned === 'true' || owned === true) {
      const ownedVehicles = await this.vehicleRepository.findOwnVehicles(UserSession.user.id);
      targetVehicleIds = ownedVehicles.map((v) => v.id);
      name = 'Owned Vehicles';
      return { vehicleIds: targetVehicleIds, name: name };
    }
    // all accessible vehicles
    else {
      const accessible = await this.vehicleRepository.findAccessibleVehicles(UserSession.user.id);
      targetVehicleIds = accessible.map((v) => v.id);
      name = 'All Vehicles';
      return { vehicleIds: targetVehicleIds, name: name };
    }
  }
}
