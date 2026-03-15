import { Injectable } from '@nestjs/common';
import { MaintenanceGetPayload, MaintenanceInclude } from '../../../prisma/generated/models/Maintenance';
import { UnitConversionService } from '../../utils/unit-conversion.service';
import { MaintenancePartTransformer } from './maintenance-part.transformer';
import { ClientMaintenance } from '@repo/validation';

@Injectable()
export class MaintenanceTransformerService {
  constructor(
    private readonly unitConversion: UnitConversionService,
    private readonly partTransformer: MaintenancePartTransformer,
  ) {}
  DB_ClientMaintenance_include() {
    return {
      vehicle: {
        select: {
          odometerType: true,
          odometer_hour: true,
          odometer_km: true,
        },
      },
      parts: {
        include: this.partTransformer.DB_MaintenancePart_Include(),
      },
    } satisfies MaintenanceInclude;
  }

  toClientFormat(maintenance: DB_clientMaintenance): ClientMaintenance {
    const odometerType = maintenance.vehicle.odometerType;
    const isHourlyOdometer = odometerType === 'HOUR';
    const baseOdometer = isHourlyOdometer ? maintenance.odometer_hour : maintenance.odometer_km;

    const odometerData = this.unitConversion.getOdometerDataByType(baseOdometer, odometerType);

    return {
      id: maintenance.id,
      date: maintenance.date,
      title: maintenance.title,
      notes: maintenance.notes,
      vehicleId: maintenance.vehicleId,
      serviceProvider: maintenance.serviceProvider,
      image: maintenance.image,
      costTotal: maintenance.costTotal,
      odometerData,
      parts: this.partTransformer.toDisplayFormat(maintenance.parts),
    };
  }
}

export type DB_clientMaintenance = MaintenanceGetPayload<{
  include: ReturnType<MaintenanceTransformerService['DB_ClientMaintenance_include']>;
}>;
