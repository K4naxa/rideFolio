import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma, VehicleType } from 'prisma/generated/client';
import { MaintenanceCategoryWithParts, MaintenanceInput } from '@repo/validation';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthValidationService } from 'src/utils/authValidation.service';
import { UnitConversionService } from 'src/utils/unit-conversion.service';
import { LimitsService } from 'src/limits/limits.service';
import { MaintenancePartTransformer } from 'src/logs/maintenance/maintenance-part.transformer';

@Injectable()
export class MaintenanceService {
  constructor(
    private prisma: PrismaService,
    private authValidation: AuthValidationService,
    private unitConversion: UnitConversionService,
    private limitsService: LimitsService,
    private partTransformer: MaintenancePartTransformer,
  ) {}

  async getCategoriesWithParts(vehicleType: VehicleType['code']): Promise<MaintenanceCategoryWithParts[]> {
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

    Logger.error('found categories for vehicle type', vehicleType, categories);
    return categories;
  }

  async createMaintenance(userSession: UserSession, maintenanceData: MaintenanceInput) {
    // 1. validate access and return
    const vehicle = await this.authValidation.hasAccessToVehicle(userSession.user.id, maintenanceData.vehicleId);

    // validate storage limits
    const sizeBytes = await this.limitsService.canCreateMaintenance(
      userSession.user.id,
      vehicle.ownerId,
      maintenanceData,
    );

    // 2. Fetch user and vehicle details
    const user = await this.prisma.user.findUnique({
      where: { id: userSession.user.id },
    });
    if (!user) {
      // Should never happen, but just to satisfy TypeScript
      throw new Error('user not found.');
    }

    // TODO: create create logic for image to bucket upload & image to db

    // 3. normalize data
    const isOdometerHourly = vehicle.odometerType === 'HOUR';
    const normalizedOdometer = this.unitConversion.normalizeOdometer(maintenanceData.odometer, vehicle.odometerType);

    await this.prisma.$transaction(async (tx) => {
      const newMaintenance = await tx.maintenance.create({
        data: {
          vehicleId: maintenanceData.vehicleId,
          userId: userSession.user.id,
          date: maintenanceData.date,
          odometer_km: isOdometerHourly ? null : normalizedOdometer,
          odometer_hour: isOdometerHourly ? normalizedOdometer : null,
          title: maintenanceData.title,
          serviceProvider: maintenanceData.serviceProvider,
          costTotal: maintenanceData.totalCost,
          notes: maintenanceData.notes,
          sizeBytes: sizeBytes,
        },
      });

      const partsToCreate = this.partTransformer.toDbFormat(newMaintenance.id, maintenanceData.parts);

      // Create MaintenanceParts entries
      await tx.maintenancePart.createMany({
        data: partsToCreate,
      });

      // Update monthly statistics
      if (maintenanceData.totalCost && maintenanceData.totalCost > 0) {
        await this.updateMonthlyStatistics({
          prisma: tx,
          vehicleId: maintenanceData.vehicleId,
          date: maintenanceData.date,
          costTotal: maintenanceData.totalCost,
        });

        // Update vehicle lifetime total cost
        await tx.vehicle.update({
          where: { id: maintenanceData.vehicleId },
          data: { lifetimeTotalCost: { increment: maintenanceData.totalCost } },
        });

        // Update user's storage usage
        await this.limitsService.incrementStorageUsage(tx, vehicle.ownerId, 'MAINTENANCE', sizeBytes);
      }
    });
  }

  // TODO: Update maintenance
  // TODO: Delete maintenance

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
