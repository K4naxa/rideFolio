import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, VehicleType } from 'prisma/generated/prisma/client';
import { MaintenanceType, TMaintenanceSchema } from '@repo/validation';
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

  async getCategoriesAndParts(vehicleType: VehicleType['code']) {
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
        nameKey: true,
        sortOrder: true,
        parts: {
          where: {
            isActive: true,
            vehicleTypes: { some: { id: vehicleType_id.id } },
          },
          select: {
            id: true,
            code: true,
            nameKey: true,
            categoryId: true,
            validLocations: {
              where: {
                vehicleTypeId: vehicleType_id.id,
              },
              select: {
                id: true,
                code: true,
                nameKey: true,
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    console.log('found categories for vehicle type', vehicleType, categories);
    return categories;
  }

  async getMaintenanceTypes(): Promise<MaintenanceType[]> {
    return await this.prisma.maintenanceType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        code: true,
        nameKey: true,
        icon: true,
        id: true,
      },
    });
  }

  async createMaintenance(userSession: UserSession, maintenanceData: TMaintenanceSchema) {
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

    // TODO: create create logic for image to bucket upload & image to db

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
          typeId: maintenanceData.typeId,
          serviceProvider: maintenanceData.serviceProvider,
          costTotal: maintenanceData.totalCost,
          notes: maintenanceData.notes,
        },
      });

      // Create MaintenanceParts entries
      for (const part of maintenanceData.parts) {
        await prisma.maintenancePart.create({
          data: {
            groupId: part.groupId,
            maintenanceId: newMaintenance.id,
            partId: part.partId,
            locationId: part.locationId,
            label: part.label,
            description: part.description,
            customPartLabel: part.customPartLabel,
          },
        });
      }

      // Update monthly statistics
      if (maintenanceData.totalCost && maintenanceData.totalCost > 0) {
        await this.updateMonthlyStatistics({
          prisma,
          vehicleId: maintenanceData.vehicleId,
          date: maintenanceData.date,
          costTotal: maintenanceData.totalCost,
        });

        // Update vehicle lifetime total cost
        await this.prisma.vehicle.update({
          where: { id: maintenanceData.vehicleId },
          data: { lifetimeTotalCost: { increment: maintenanceData.totalCost } },
        });
      }
    });
  }

  // Helpers
  private async updateMonthlyStatistics({
    prisma,
    vehicleId,
    date,
    costTotal,
  }: {
    prisma: Prisma.TransactionClient;
    vehicleId: string;
    date: Date;
    costTotal: number;
  }) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    await prisma.vehicleMonthlyStatistics.upsert({
      where: {
        vehicleId_year_month: { vehicleId, year, month },
      },
      update: {
        totalMaintenanceCost: { increment: costTotal },
        monthlyRunningCost: { increment: costTotal },
      },
      create: {
        vehicleId,
        year,
        month,
        monthlyRunningCost: costTotal,
        totalMaintenanceCost: costTotal,
      },
    });
  }
}
