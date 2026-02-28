import { Prisma, VehiclePartLocation } from 'prisma/generated/client';
import type { VehicleTypesResult } from './vehicle-types';

export interface VehiclePartLocationsResult {
  // Car locations
  car_fl: VehiclePartLocation;
  car_fr: VehiclePartLocation;
  car_rl: VehiclePartLocation;
  car_rr: VehiclePartLocation;
  car_front: VehiclePartLocation;
  car_rear: VehiclePartLocation;
  // Motorcycle locations
  moto_front: VehiclePartLocation;
  moto_rear: VehiclePartLocation;
  // Helper collections
  carWheelLocs: VehiclePartLocation[];
  motoFrontRear: VehiclePartLocation[];
}

export async function seedVehiclePartLocations(
  tx: Prisma.TransactionClient,
  vehicleTypes: VehicleTypesResult,
): Promise<VehiclePartLocationsResult> {
  console.log('📍 Seeding vehicle part locations...');

  const { car, motorcycle, boat, other } = vehicleTypes;

  // Car locations
  const car_fl = await tx.vehiclePartLocation.create({
    data: { code: 'front_left', vehicleTypeId: car.id, nameKey: 'vehicle.part.locations.front_left' },
  });
  const car_fr = await tx.vehiclePartLocation.create({
    data: { code: 'front_right', vehicleTypeId: car.id, nameKey: 'vehicle.part.locations.front_right' },
  });
  const car_rl = await tx.vehiclePartLocation.create({
    data: { code: 'rear_left', vehicleTypeId: car.id, nameKey: 'vehicle.part.locations.rear_left' },
  });
  const car_rr = await tx.vehiclePartLocation.create({
    data: { code: 'rear_right', vehicleTypeId: car.id, nameKey: 'vehicle.part.locations.rear_right' },
  });
  const car_front = await tx.vehiclePartLocation.create({
    data: { code: 'front', vehicleTypeId: car.id, nameKey: 'vehicle.part.locations.front' },
  });
  const car_rear = await tx.vehiclePartLocation.create({
    data: { code: 'rear', vehicleTypeId: car.id, nameKey: 'vehicle.part.locations.rear' },
  });

  // Motorcycle locations
  const moto_front = await tx.vehiclePartLocation.create({
    data: { code: 'front', vehicleTypeId: motorcycle.id, nameKey: 'vehicle.part.locations.front' },
  });
  const moto_rear = await tx.vehiclePartLocation.create({
    data: { code: 'rear', vehicleTypeId: motorcycle.id, nameKey: 'vehicle.part.locations.rear' },
  });

  // Boat locations
  await tx.vehiclePartLocation.create({
    data: { code: 'front', vehicleTypeId: boat.id, nameKey: 'vehicle.part.locations.front' },
  });
  await tx.vehiclePartLocation.create({
    data: { code: 'rear', vehicleTypeId: boat.id, nameKey: 'vehicle.part.locations.rear' },
  });
  await tx.vehiclePartLocation.create({
    data: { code: 'port', vehicleTypeId: boat.id, nameKey: 'vehicle.part.locations.port' },
  });
  await tx.vehiclePartLocation.create({
    data: { code: 'starboard', vehicleTypeId: boat.id, nameKey: 'vehicle.part.locations.starboard' },
  });

  // Other locations
  await tx.vehiclePartLocation.create({
    data: { code: 'front_left', vehicleTypeId: other.id, nameKey: 'vehicle.part.locations.front_left' },
  });
  await tx.vehiclePartLocation.create({
    data: { code: 'front_right', vehicleTypeId: other.id, nameKey: 'vehicle.part.locations.front_right' },
  });
  await tx.vehiclePartLocation.create({
    data: { code: 'rear_left', vehicleTypeId: other.id, nameKey: 'vehicle.part.locations.rear_left' },
  });
  await tx.vehiclePartLocation.create({
    data: { code: 'rear_right', vehicleTypeId: other.id, nameKey: 'vehicle.part.locations.rear_right' },
  });
  await tx.vehiclePartLocation.create({
    data: { code: 'front', vehicleTypeId: other.id, nameKey: 'vehicle.part.locations.front' },
  });
  await tx.vehiclePartLocation.create({
    data: { code: 'rear', vehicleTypeId: other.id, nameKey: 'vehicle.part.locations.rear' },
  });

  // Helper collections
  const carWheelLocs = [car_fl, car_fr, car_rl, car_rr];
  const motoFrontRear = [moto_front, moto_rear];

  console.log('✅ Vehicle part locations seeded');

  return {
    car_fl,
    car_fr,
    car_rl,
    car_rr,
    car_front,
    car_rear,
    moto_front,
    moto_rear,
    carWheelLocs,
    motoFrontRear,
  };
}
