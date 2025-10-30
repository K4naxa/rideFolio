import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isVehicleTypeCode, TMaintenanceBackendSchema, TVehicleTypeCode } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';

@Injectable()
export class MaintenanceService {
  constructor(
    private prisma: PrismaService,
    private authValidation: AuthValidationService,
    private unitConversion: UnitConversionService,
  ) {}

  async getCategoriesAndParts(vehicleType: TVehicleTypeCode) {
    if (!isVehicleTypeCode(vehicleType)) {
      throw new BadRequestException(`Invalid vehicle type code: ${String(vehicleType)}`);
    }

    const vehicleType_id = await this.prisma.vehicleType.findUnique({
      where: { code: vehicleType },
      select: { id: true },
    });

    if (!vehicleType_id) {
      throw new BadRequestException(`Vehicle type not found: ${String(vehicleType)}`);
    }

    const categories = await this.prisma.maintenanceCategory.findMany({
      where: {
        isActive: true,
        parts: { some: { vehicleTypes: { some: { id: vehicleType_id.id } } } },
      },
      select: {
        id: true,
        code: true,
        sortOrder: true,
        parts: {
          where: {
            isActive: true,
            vehicleTypes: { some: { id: vehicleType_id.id } },
          },
          select: {
            id: true,
            code: true,
            sortOrder: true,
            isActive: true,
            categoryId: true,
            validLocations: {
              where: {
                vehicleTypeId: vehicleType_id.id,
              },
              select: {
                id: true,
                code: true,
              },
            },
          },
        },
      },
    });

    console.log('found categories for vehicle type', vehicleType, categories);
    return categories;
  }

  async createMaintenance(userSession: UserSession, maintenanceData: TMaintenanceBackendSchema) {
    // 1. Check if the user has permission to create logs for the vehicle
    await this.authValidation.canCreateLogs(userSession.user.id, maintenanceData.vehicleId);

    // 2. Fetch user and vehicle details
    const user = await this.prisma.user.findUnique({
      where: { id: userSession.user.id },
    });
    if (!user) {
      // Should never happen, but just to satisfy TypeScript
      throw new Error('User not found.');
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: maintenanceData.vehicleId },
    });
    if (!vehicle) {
      // Should never happen, but just to satisfy TypeScript
      throw new Error('Vehicle not found.');
    }

    // 3. normalize data
    const isOdometerHourly = vehicle.odometerType === 'HOUR';
    const normalizedOdometer = this.unitConversion.normalizeOdometer(maintenanceData.odometer, vehicle.odometerType);

    await this.prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      const newMaintenance = await prisma.maintenance.create({
        data: {
          vehicleId: maintenanceData.vehicleId,
          userId: userSession.user.id,
          date: maintenanceData.date,
          odometer_km: isOdometerHourly ? null : normalizedOdometer,
          odometer_hour: isOdometerHourly ? normalizedOdometer : null,
          maintenanceType: maintenanceData.maintenanceType,
          serviceProvider: maintenanceData.serviceProvider,
          costTotal: maintenanceData.totalCost,
          notes: maintenanceData.notes,
        },
      });

      // Create MaintenanceParts entries
      for (const part of maintenanceData.parts) {
        await prisma.maintenancePart.create({
          data: {
            maintenanceId: newMaintenance.id,
            partId: part.id,
            locationId: part.locationId,
            cost: part.cost,
            quantity: part.quantity,
          },
        });
      }
    });
  }
}
