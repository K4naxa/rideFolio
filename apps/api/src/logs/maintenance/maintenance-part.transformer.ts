import { Injectable } from '@nestjs/common';
import { type MaintenancePartDisplay, MaintenancePartInput } from '@repo/validation';
import { MaintenancePart, VehiclePart, VehiclePartLocation } from 'prisma/generated/prisma/client';

type MaintenancePartWithRelations = MaintenancePart & {
  part: VehiclePart;
  location: VehiclePartLocation;
};
type MaintenancePartDbFormat = Omit<MaintenancePart, 'id'>;
@Injectable()
export class MaintenancePartTransformer {
  toDisplayFormat(dbParts: MaintenancePartWithRelations[]): MaintenancePartDisplay[] {
    const partGroups = new Map<string, MaintenancePartDisplay>();

    for (const dbPart of dbParts) {
      const existing = partGroups.get(dbPart.groupId);
      if (existing) {
        // Add location to existing group
        if (dbPart.locationId && dbPart.location) {
          existing.locations.push({
            id: dbPart.location.id,
            code: dbPart.location.code,
            nameKey: dbPart.location.nameKey,
          });
        }
      } else {
        // Create new group entry
        partGroups.set(dbPart.groupId, {
          groupId: dbPart.groupId,
          partId: dbPart.part.id,
          partCode: dbPart.part.code,
          partNameKey: dbPart.part.nameKey,
          customName: dbPart.customName,
          label: dbPart.label,
          description: dbPart.description,
          // Add location if exists
          locations:
            dbPart.locationId && dbPart.location
              ? [
                  {
                    id: dbPart.location.id,
                    code: dbPart.location.code,
                    nameKey: dbPart.location.nameKey,
                  },
                ]
              : [],
        });
      }
    }
    return Array.from(partGroups.values());
  }

  toDbFormat(maintenanceId: string, inputParts: MaintenancePartInput[]): MaintenancePartDbFormat[] {
    const dbParts: MaintenancePartDbFormat[] = [];

    for (const part of inputParts) {
      // If no locations, create a single row with null location
      if (part.locations?.length === 0 || !part.locations) {
        dbParts.push({
          maintenanceId,
          partId: part.partId,
          groupId: part.groupId,
          customName: part.customName || null,
          label: part.label || null,
          description: part.description || null,
          locationId: null,
        });
      } else {
        // Create one row per location
        const generatedGroupId = crypto.randomUUID();
        for (const location of part.locations) {
          dbParts.push({
            maintenanceId,
            partId: part.partId,
            groupId: generatedGroupId,
            customName: part.customName || null,
            label: part.label || null,
            description: part.description || null,
            locationId: location.id,
          });
        }
      }
    }
    return dbParts;
  }
}
