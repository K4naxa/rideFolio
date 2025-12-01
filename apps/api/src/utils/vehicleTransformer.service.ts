import { Injectable } from '@nestjs/common';
import { Vehicle } from 'prisma/generated/prisma/client';
import { TAccessibleVehicle, TBasicVehicle, TPoolVehicle } from '@repo/validation';
import { OdometerService } from 'src/utils/odometer.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';

interface RawVehicleWithPools extends Vehicle {
  vehicleType: {
    code: string;
    nameKey: string;
    icon: string | null;
  };
  pools?: {
    allowMembersToAddLogs: boolean;
    allowMembersToEditLogs: boolean;
    allowMembersToDeleteLogs: boolean;
    pool: {
      id: string;
      name: string;
    };
  }[];
}

interface RawPoolVehicle {
  addedAt: Date;
  vehicle: Vehicle & {
    vehicleType: {
      code: string;
      nameKey: string;
      icon: string | null;
    };
    owner: {
      id: string;
      name: string;
      email: string;
      image: string | null; // Handle nullable image
    };
  };
}

interface RawBasicVehicle extends Vehicle {
  vehicleType: {
    code: string;
    nameKey: string;
    icon: string | null;
  };
}

@Injectable()
export class VehicleTransformerService {
  constructor(
    private odometerService: OdometerService,
    private unitConversion: UnitConversionService,
  ) {}

  // Transform raw vehicle to TBasicVehicle
  toBasicVehicle(rawVehicle: RawBasicVehicle): TBasicVehicle {
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

  // Transform raw vehicle with pools to TAccessibleVehicle
  toAccessibleVehicle(rawVehicle: RawVehicleWithPools, userId: string): TAccessibleVehicle {
    const isOwnerUser = rawVehicle.ownerId === userId;

    // Pool permission logic
    let canCreateLogs = false;
    let canEditLogs = false;
    let canDeleteLogs = false;
    let poolId: string | null = null;

    const poolAccess = rawVehicle.pools?.[0];
    if (poolAccess) {
      poolId = poolAccess.pool.id;
      canCreateLogs = poolAccess.allowMembersToAddLogs;
      canEditLogs = poolAccess.allowMembersToEditLogs;
      canDeleteLogs = poolAccess.allowMembersToDeleteLogs;
    }

    // Owner override
    if (isOwnerUser) {
      canCreateLogs = true;
      canEditLogs = true;
      canDeleteLogs = true;
    }

    return {
      isOwnerUser,
      canCreateLogs,
      canEditLogs,
      canDeleteLogs,
      poolId,
      vehicleData: this.toBasicVehicle(rawVehicle),
    };
  }

  // Transform to pool Vehicle
  toPoolVehicle(rawVehicleData: RawPoolVehicle, userId: string): TPoolVehicle {
    return {
      addedAt: rawVehicleData.addedAt,
      isOwnerUser: rawVehicleData.vehicle.owner.id === userId,
      vehicleData: this.toBasicVehicle(rawVehicleData.vehicle),
      owner: {
        id: rawVehicleData.vehicle.owner.id,
        name: rawVehicleData.vehicle.owner.name,
        email: rawVehicleData.vehicle.owner.email,
        image: rawVehicleData.vehicle.owner.image,
      },
    };
  }
}
