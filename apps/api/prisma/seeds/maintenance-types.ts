import { Prisma } from 'prisma/generated/prisma/client';

export async function seedMaintenanceTypes(tx: Prisma.TransactionClient): Promise<void> {
  console.log('🔧 Seeding maintenance types...');

  await tx.maintenanceType.create({
    data: {
      code: 'preventive',
      nameKey: 'maintenance.types.preventive',
      icon: 'shieldCheck',
      sortOrder: 1,
    },
  });

  await tx.maintenanceType.create({
    data: {
      code: 'maintenance',
      nameKey: 'maintenance.types.maintenance',
      icon: 'wrench',
      sortOrder: 2,
    },
  });

  await tx.maintenanceType.create({
    data: {
      code: 'repair',
      nameKey: 'maintenance.types.repair',
      icon: 'toolcase',
      sortOrder: 3,
    },
  });

  await tx.maintenanceType.create({
    data: {
      code: 'warranty',
      nameKey: 'maintenance.types.warranty',
      icon: 'shield',
      sortOrder: 4,
    },
  });

  await tx.maintenanceType.create({
    data: {
      code: 'inspection',
      nameKey: 'maintenance.types.inspection',
      icon: 'search',
      sortOrder: 5,
    },
  });

  await tx.maintenanceType.create({
    data: {
      code: 'documentation',
      nameKey: 'maintenance.types.documentation',
      icon: 'fileText',
      sortOrder: 6,
    },
  });

  await tx.maintenanceType.create({
    data: {
      code: 'upgrade',
      nameKey: 'maintenance.types.upgrade',
      icon: 'arrowUp',
      sortOrder: 7,
    },
  });

  await tx.maintenanceType.create({
    data: {
      code: 'other',
      nameKey: 'maintenance.types.other',
      icon: 'dotsHorizontal',
      sortOrder: 8,
    },
  });

  console.log('✅ Maintenance types seeded');
}
