import { MaintenanceCategory, Prisma } from 'prisma/generated/client';

export interface MaintenanceCategoriesResult {
  cat_engine: MaintenanceCategory;
  cat_transmission_and_drivetrain: MaintenanceCategory;
  cat_cooling_systems: MaintenanceCategory;
  cat_fuel_systems: MaintenanceCategory;
  cat_exhaust_and_emissions: MaintenanceCategory;
  cat_brakes: MaintenanceCategory;
  cat_suspension_and_steering: MaintenanceCategory;
  cat_tires_and_wheels: MaintenanceCategory;
  cat_electrical_electronics: MaintenanceCategory;
  cat_hvac: MaintenanceCategory;
  cat_fluids_and_filters: MaintenanceCategory;
  cat_body_exterior: MaintenanceCategory;
}

export async function seedMaintenanceCategories(tx: Prisma.TransactionClient): Promise<MaintenanceCategoriesResult> {
  console.log('📂 Seeding maintenance categories...');

  const cat_engine = await tx.maintenanceCategory.create({
    data: { code: 'engine', sortOrder: 1, nameKey: 'maintenance.categories.engine' },
  });

  const cat_transmission_and_drivetrain = await tx.maintenanceCategory.create({
    data: {
      code: 'transmission_and_drivetrain',
      sortOrder: 2,
      nameKey: 'maintenance.categories.transmission_and_drivetrain',
    },
  });

  const cat_cooling_systems = await tx.maintenanceCategory.create({
    data: { code: 'cooling_systems', sortOrder: 3, nameKey: 'maintenance.categories.cooling_systems' },
  });

  const cat_fuel_systems = await tx.maintenanceCategory.create({
    data: { code: 'fuel_systems', sortOrder: 4, nameKey: 'maintenance.categories.fuel_systems' },
  });

  const cat_exhaust_and_emissions = await tx.maintenanceCategory.create({
    data: { code: 'exhaust_and_emissions', sortOrder: 5, nameKey: 'maintenance.categories.exhaust_and_emissions' },
  });

  const cat_brakes = await tx.maintenanceCategory.create({
    data: { code: 'brakes', sortOrder: 6, nameKey: 'maintenance.categories.brakes' },
  });

  const cat_suspension_and_steering = await tx.maintenanceCategory.create({
    data: {
      code: 'suspension_and_steering',
      sortOrder: 7,
      nameKey: 'maintenance.categories.suspension_and_steering',
    },
  });

  const cat_tires_and_wheels = await tx.maintenanceCategory.create({
    data: { code: 'tires_and_wheels', sortOrder: 8, nameKey: 'maintenance.categories.tires_and_wheels' },
  });

  const cat_electrical_electronics = await tx.maintenanceCategory.create({
    data: { code: 'electrical_electronics', sortOrder: 9, nameKey: 'maintenance.categories.electrical_electronics' },
  });

  const cat_hvac = await tx.maintenanceCategory.create({
    data: { code: 'hvac', sortOrder: 10, nameKey: 'maintenance.categories.hvac' },
  });

  const cat_fluids_and_filters = await tx.maintenanceCategory.create({
    data: { code: 'fluids_and_filters', sortOrder: 11, nameKey: 'maintenance.categories.fluids_and_filters' },
  });

  const cat_body_exterior = await tx.maintenanceCategory.create({
    data: { code: 'body_exterior', sortOrder: 12, nameKey: 'maintenance.categories.body_exterior' },
  });

  await tx.maintenanceCategory.create({
    data: { code: 'interior', sortOrder: 13, nameKey: 'maintenance.categories.interior' },
  });

  await tx.maintenanceCategory.create({
    data: { code: 'other', sortOrder: 14, nameKey: 'maintenance.categories.other' },
  });

  console.log('✅ Maintenance categories seeded');

  return {
    cat_engine,
    cat_transmission_and_drivetrain,
    cat_cooling_systems,
    cat_fuel_systems,
    cat_exhaust_and_emissions,
    cat_brakes,
    cat_suspension_and_steering,
    cat_tires_and_wheels,
    cat_electrical_electronics,
    cat_hvac,
    cat_fluids_and_filters,
    cat_body_exterior,
  };
}
