import { prisma } from 'src/lib/prisma';
import { seedVehicleTypes } from './seeds/vehicle-types';
import { seedVehiclePartLocations } from './seeds/vehicle-part-locations';
import { seedMaintenanceTypes } from './seeds/maintenance-types';
import { seedMaintenanceCategories } from './seeds/maintenance-categories';
import { seedVehicleParts } from './seeds/vehicle-parts';
import { seedSubscriptionPlans } from 'prisma/seeds/subscription-plans';

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Reset current database
  console.log('🗑️  Cleaning database...');
  await prisma.user.deleteMany();
  await prisma.vehiclePartLocation.deleteMany();
  await prisma.vehicleType.deleteMany();
  await prisma.vehiclePart.deleteMany();
  await prisma.maintenanceCategory.deleteMany();
  await prisma.maintenanceType.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  console.log('✅ Database cleaned\n');

  // Run all seed functions within a transaction
  await prisma.$transaction(async (tx) => {
    // Seed vehicle types
    const vehicleTypes = await seedVehicleTypes(tx);

    // Seed vehicle part locations
    const locations = await seedVehiclePartLocations(tx, vehicleTypes);

    // Seed maintenance types
    await seedMaintenanceTypes(tx);

    // Seed maintenance categories
    const categories = await seedMaintenanceCategories(tx);

    // Seed vehicle parts
    await seedVehicleParts(tx, vehicleTypes, locations, categories);

    // Seed Subscription plans
    await seedSubscriptionPlans(tx);
  });

  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
