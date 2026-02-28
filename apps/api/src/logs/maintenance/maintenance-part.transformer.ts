import { Injectable } from '@nestjs/common';
import { type MaintenancePartDisplay, MaintenancePartInput } from '@repo/validation';
import { MaintenancePart } from 'prisma/generated/client';
import { MaintenancePartGetPayload, MaintenancePartInclude } from '../../../prisma/generated/models/MaintenancePart';

type MaintenancePartDbFormat = Omit<MaintenancePart, 'id'>;
@Injectable()
export class MaintenancePartTransformer {
  // Used to fetch Maintenance Parts for a given maintenance
  DB_MaintenancePart_Include() {
    return {
      part: true,
      location: true,
    } satisfies MaintenancePartInclude;
  }

  toDisplayFormat(dbParts: DB_MaintenancePart[]): MaintenancePartDisplay[] {
    const partGroups = new Map<string, MaintenancePartDisplay>();

    for (const dbPart of dbParts) {
      const existing = partGroups.get(dbPart.groupId);
      if (existing) {
        // Add location to an existing group
        if (dbPart.locationId && dbPart.location) {
          existing.locations.push({
            id: dbPart.location.id,
            code: dbPart.location.code,
            nameKey: dbPart.location.nameKey,
          });
        }
      } else {
        // Create a new group entry
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
      // If no locations, create a single row with a null location
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

export type DB_MaintenancePart = MaintenancePartGetPayload<{
  include: ReturnType<MaintenancePartTransformer['DB_MaintenancePart_Include']>;
}>;
