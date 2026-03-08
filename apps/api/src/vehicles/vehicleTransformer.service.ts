import { Injectable } from '@nestjs/common';
import { Vehicle } from 'prisma/generated/client';
import { BasicVehicle, TAccessibleVehicle, VehicleMinimal } from '@repo/validation';
import { OdometerService } from 'src/utils/odometer.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';

interface RawVehicleWithGroups extends Vehicle {
  vehicleType: {
    code: string;
    nameKey: string;
    icon: string | null;
  };
  groups?: {
    group: {
      id: string;
      name: string;
    };
  }[];
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

  toMinimalVehicle(rawVehicle: RawBasicVehicle): VehicleMinimal {
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
  toBasicVehicle(rawVehicle: RawBasicVehicle): BasicVehicle {
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
  toAccessibleVehicle(rawVehicle: RawVehicleWithGroups, userId: string): TAccessibleVehicle {
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
