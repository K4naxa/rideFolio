import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';

import { BasicVehicle, TAccessibleVehicle, VehicleMinimal } from '@repo/validation';
import { OdometerService } from 'src/utils/odometer.service';

@Injectable()
export class VehicleTransformerService {
  constructor(private odometerService: OdometerService) {}

  DBInclude_BasicVehicle = {
    vehicleType: {
      select: {
        code: true,
        nameKey: true,
        icon: true,
      },
    },
  } satisfies Prisma.VehicleInclude;

  DBInclude_BasicVehicleWithGroups(userId: string) {
    return {
      ...this.DBInclude_BasicVehicle,
      groups: {
        where: {
          group: {
            members: { some: { userId } },
          },
        },
        select: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    } satisfies Prisma.VehicleInclude;
  }

  toMinimalVehicle(rawVehicle: DB_BasicVehicle): VehicleMinimal {
    return {
      id: rawVehicle.id,
      name: rawVehicle.name,
      make: rawVehicle.make,
      model: rawVehicle.model,
      type: rawVehicle.vehicleType.code,
      image: rawVehicle.image,
    };
  }

  // Transform raw vehicle to TBasicVehicle
  toBasicVehicle(rawVehicle: DB_BasicVehicle): BasicVehicle {
    return {
      id: rawVehicle.id,
      name: rawVehicle.name,
      type: {
        code: rawVehicle.vehicleType.code,
        nameKey: rawVehicle.vehicleType.nameKey,
        icon: rawVehicle.vehicleType.icon,
      },
      image: rawVehicle.image,
      vin: rawVehicle.vin,
      make: rawVehicle.make,
      model: rawVehicle.model,
      year: rawVehicle.year,
      licensePlate: rawVehicle.licensePlate,
      fuelType: rawVehicle.fuelType,
      odometerData: this.odometerService.getOdometerValues(rawVehicle),
    };
  }

  // Transform raw vehicle with groups to TAccessibleVehicle
  toAccessibleVehicle(rawVehicle: DB_BasicVehicleWithGroups, userId: string): TAccessibleVehicle {
    const isOwnerUser = rawVehicle.ownerId === userId;
    const groupAccess = rawVehicle.groups?.[0];

    return {
      isOwnerUser,
      group: groupAccess
        ? {
            id: groupAccess.group.id,
            name: groupAccess.group.name,
          }
        : null,
      vehicleData: this.toBasicVehicle(rawVehicle),
    };
  }
}

export type DB_BasicVehicle = Prisma.VehicleGetPayload<{
  include: VehicleTransformerService['DBInclude_BasicVehicle'];
}>;
export type DB_BasicVehicleWithGroups = Prisma.VehicleGetPayload<{
  include: ReturnType<VehicleTransformerService['DBInclude_BasicVehicleWithGroups']>;
}>;
