import { Prisma, VehicleType } from 'prisma/generated/prisma/client';

export interface VehicleTypesResult {
  car: VehicleType;
  motorcycle: VehicleType;
  boat: VehicleType;
  other: VehicleType;
}

export async function seedVehicleTypes(tx: Prisma.TransactionClient): Promise<VehicleTypesResult> {
  console.log('🚗 Seeding vehicle types...');

  const car = await tx.vehicleType.create({
    data: { code: 'car', nameKey: 'vehicle.types.car', icon: 'car' },
  });

  const motorcycle = await tx.vehicleType.create({
    data: { code: 'motorcycle', nameKey: 'vehicle.types.motorcycle', icon: 'motorcycle' },
  });

  const boat = await tx.vehicleType.create({
    data: { code: 'boat', nameKey: 'vehicle.types.boat', icon: 'boat' },
  });

  const other = await tx.vehicleType.create({
    data: { code: 'other', nameKey: 'vehicle.types.other', icon: 'otherVehicle' },
  });

  console.log('✅ Vehicle types seeded');

  return { car, motorcycle, boat, other };
}
