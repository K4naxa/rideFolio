import { prisma } from 'src/lib/prisma';

async function main() {
  // reset current database
  await prisma.user.deleteMany();
  await prisma.vehiclePartLocation.deleteMany();
  await prisma.vehicleType.deleteMany();
  await prisma.vehiclePart.deleteMany();
  await prisma.maintenanceCategory.deleteMany();

  // 1. Create 10 users
  await prisma.$transaction(async (tx) => {
    // ** SEEDING VEHICLE TYPES
    console.log('Seeding vehicle types...');

    const car = await tx.vehicleType.create({ data: { code: 'car', nameKey: 'vehicle.types.car', icon: 'car' } });
    const motorcycle = await tx.vehicleType.create({
      data: { code: 'motorcycle', nameKey: 'vehicle.types.motorcycle', icon: 'motorcycle' },
    });
    const boat = await tx.vehicleType.create({ data: { code: 'boat', nameKey: 'vehicle.types.boat', icon: 'boat' } });
    const other = await tx.vehicleType.create({
      data: { code: 'other', nameKey: 'vehicle.types.other', icon: 'otherVehicle' },
    });

    console.log('✅ Seeding vehicle types completed.');

    // ** SEEDING LOCATIONS
    console.log('Seeding locations...');
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
    // Boat locations (not used yet, but created for completeness, no assigned vars to avoid unused warnings)
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
    // Other locations (not used yet)
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

    // Helper collections for locations (after all created)
    const carWheelLocs = [car_fl, car_fr, car_rl, car_rr];
    const motoFrontRear = [moto_front, moto_rear];

    console.log('✅ Seeding locations completed.');

    // ================================================================
    // MAINTENANCE TYPES
    // ================================================================
    console.log('🔧 Seeding maintenance types...');

    await tx.maintenanceType.create({
      data: {
        code: 'preventive',
        nameKey: 'maintenance.types.preventive',
        icon: 'shield-check',
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
        icon: 'tool',
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
        icon: 'file-text',
        sortOrder: 6,
      },
    });

    await tx.maintenanceType.create({
      data: {
        code: 'upgrade',
        nameKey: 'maintenance.types.upgrade',
        icon: 'arrow-up',
        sortOrder: 7,
      },
    });

    await tx.maintenanceType.create({
      data: {
        code: 'other',
        nameKey: 'maintenance.types.other',
        icon: 'more-horizontal',
        sortOrder: 8,
      },
    });

    console.log('✅ Maintenance types seeded');

    // ** SEEDING MAINTENANCE CATEGORIES **
    console.log('Seeding maintenance categories...');
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
    console.log('✅ Seeding maintenance categories completed.');

    // ** CREATE PARTS AND LINK THEM TO VEHICLE TYPES **
    console.log('Seeding vehicle parts...');

    // Category - Engine
    await tx.vehiclePart.create({
      data: {
        code: 'spark_plugs',
        nameKey: 'maintenance.parts.spark_plugs',
        categoryId: cat_engine.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 1,
      },
    });

    await tx.vehiclePart.create({
      data: {
        code: 'engine_oil',
        nameKey: 'maintenance.parts.engine_oil',
        categoryId: cat_engine.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 2,
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'engine_oil_filter',
        nameKey: 'maintenance.parts.engine_oil_filter',
        categoryId: cat_engine.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: true,
        sortOrder: 3,
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'timing_belt',
        nameKey: 'maintenance.parts.timing_belt',
        categoryId: cat_engine.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 4,
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'timing_chain',
        nameKey: 'maintenance.parts.timing_chain',
        categoryId: cat_engine.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 5,
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'ignition_coil',
        nameKey: 'maintenance.parts.ignition_coil',
        categoryId: cat_engine.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: false,
        sortOrder: 6,
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'engine_mount',
        nameKey: 'maintenance.parts.engine_mount',
        categoryId: cat_engine.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: false,
        sortOrder: 7,
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'engine_other',
        categoryId: cat_engine.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: false,
        sortOrder: 999,
        nameKey: 'maintenance.parts.engine_other',
      },
    });

    // Category - Transmission & Drivetrain

    await tx.vehiclePart.create({
      data: {
        code: 'transmission_fluid',
        categoryId: cat_transmission_and_drivetrain.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 1,
        nameKey: 'maintenance.parts.transmission_fluid',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'transmission_filter',
        categoryId: cat_transmission_and_drivetrain.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: false,
        sortOrder: 2,
        nameKey: 'maintenance.parts.transmission_filter',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'clutch_kit',
        categoryId: cat_transmission_and_drivetrain.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: false,
        sortOrder: 3,
        nameKey: 'maintenance.parts.clutch_kit',
      },
    });

    await tx.vehiclePart.create({
      data: {
        code: 'cv_axle',
        categoryId: cat_transmission_and_drivetrain.id,
        vehicleTypes: { connect: [{ id: car.id }] },
        validLocations: { connect: carWheelLocs.map((l) => ({ id: l.id })) },
        isCommon: false,
        sortOrder: 4,
        nameKey: 'maintenance.parts.cv_axle',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'driveshaft',
        categoryId: cat_transmission_and_drivetrain.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: false,
        sortOrder: 5,
        nameKey: 'maintenance.parts.driveshaft',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'chain',
        categoryId: cat_transmission_and_drivetrain.id,
        vehicleTypes: { connect: [{ id: motorcycle.id }] },
        isCommon: true,
        sortOrder: 6,
        nameKey: 'maintenance.parts.chain',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'belt',
        categoryId: cat_transmission_and_drivetrain.id,
        vehicleTypes: { connect: [{ id: motorcycle.id }] },
        isCommon: true,
        sortOrder: 6,
        nameKey: 'maintenance.parts.belt',
      },
    });

    await tx.vehiclePart.create({
      data: {
        code: 'front_sprocket',
        categoryId: cat_transmission_and_drivetrain.id,
        vehicleTypes: { connect: [{ id: motorcycle.id }] },
        isCommon: true,
        sortOrder: 7,
        nameKey: 'maintenance.parts.front_sprocket',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'rear_sprocket',
        categoryId: cat_transmission_and_drivetrain.id,
        vehicleTypes: { connect: [{ id: motorcycle.id }] },
        isCommon: true,
        sortOrder: 8,
        nameKey: 'maintenance.parts.rear_sprocket',
      },
    });

    await tx.vehiclePart.create({
      data: {
        code: 'transmission_and_drivetrain_other',
        categoryId: cat_transmission_and_drivetrain.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 999,
        nameKey: 'maintenance.parts.transmission_and_drivetrain_other',
      },
    });

    // Category - Cooling Systems
    await tx.vehiclePart.create({
      data: {
        code: 'coolant',
        categoryId: cat_cooling_systems.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 1,
        nameKey: 'maintenance.parts.coolant',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'water_pump',
        categoryId: cat_cooling_systems.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }] },
        isCommon: false,
        sortOrder: 2,
        nameKey: 'maintenance.parts.water_pump',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'thermostat',
        categoryId: cat_cooling_systems.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: false,
        sortOrder: 3,
        nameKey: 'maintenance.parts.thermostat',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'radiator',
        categoryId: cat_cooling_systems.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: false,
        sortOrder: 4,
        nameKey: 'maintenance.parts.radiator',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'radiator_hose',
        categoryId: cat_cooling_systems.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: false,
        sortOrder: 5,
        nameKey: 'maintenance.parts.radiator_hose',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'cooling_systems_other',
        categoryId: cat_cooling_systems.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: false,
        sortOrder: 999,
        nameKey: 'maintenance.parts.cooling_systems_other',
      },
    });

    // Category - Fuel Systems
    await tx.vehiclePart.create({
      data: {
        code: 'fuel_filter',
        categoryId: cat_fuel_systems.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 1,
        nameKey: 'maintenance.parts.fuel_filter',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'fuel_pump',
        categoryId: cat_fuel_systems.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: false,
        sortOrder: 2,
        nameKey: 'maintenance.parts.fuel_pump',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'fuel_injector',
        categoryId: cat_fuel_systems.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: false,
        sortOrder: 3,
        nameKey: 'maintenance.parts.fuel_injector',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'fuel_systems_other',
        categoryId: cat_fuel_systems.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: false,
        sortOrder: 999,
        nameKey: 'maintenance.parts.fuel_systems_other',
      },
    });

    // Category - Exhaust & Emissions
    await tx.vehiclePart.create({
      data: {
        code: 'muffler',
        categoryId: cat_exhaust_and_emissions.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: false,
        sortOrder: 1,
        nameKey: 'maintenance.parts.muffler',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'catalytic_converter',
        categoryId: cat_exhaust_and_emissions.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: false,
        sortOrder: 2,
        nameKey: 'maintenance.parts.catalytic_converter',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'oxygen_sensor',
        categoryId: cat_exhaust_and_emissions.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: false,
        sortOrder: 3,
        nameKey: 'maintenance.parts.oxygen_sensor',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'egr_valve',
        categoryId: cat_exhaust_and_emissions.id,
        vehicleTypes: { connect: [{ id: car.id }] },
        isCommon: false,
        sortOrder: 4,
        nameKey: 'maintenance.parts.egr_valve',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'exhaust_and_emissions_other',
        categoryId: cat_exhaust_and_emissions.id,
        vehicleTypes: { connect: [{ id: car.id }] },
        isCommon: false,
        sortOrder: 999,
        nameKey: 'maintenance.parts.exhaust_and_emissions_other',
      },
    });

    // Category - Brakes
    await tx.vehiclePart.create({
      data: {
        code: 'brake_pads',
        categoryId: cat_brakes.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        validLocations: {
          connect: [...carWheelLocs.map((l) => ({ id: l.id })), ...motoFrontRear.map((l) => ({ id: l.id }))],
        },
        isCommon: true,
        sortOrder: 1,
        nameKey: 'maintenance.parts.brake_pads',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'brake_disc',
        categoryId: cat_brakes.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        validLocations: {
          connect: [...carWheelLocs.map((l) => ({ id: l.id })), ...motoFrontRear.map((l) => ({ id: l.id }))],
        },
        isCommon: true,
        sortOrder: 2,
        nameKey: 'maintenance.parts.brake_disc',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'brake_caliper',
        categoryId: cat_brakes.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        validLocations: {
          connect: [...carWheelLocs.map((l) => ({ id: l.id })), ...motoFrontRear.map((l) => ({ id: l.id }))],
        },
        isCommon: false,
        sortOrder: 3,
        nameKey: 'maintenance.parts.brake_caliper',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'brake_fluid',
        categoryId: cat_brakes.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: true,
        sortOrder: 4,
        nameKey: 'maintenance.parts.brake_fluid',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'brakes_other',
        categoryId: cat_brakes.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: true,
        sortOrder: 4,
        nameKey: 'maintenance.parts.brakes_other',
      },
    });

    // Category - Suspension & Steering
    await tx.vehiclePart.create({
      data: {
        code: 'shock_absorber',
        categoryId: cat_suspension_and_steering.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        validLocations: {
          connect: [...carWheelLocs.map((l) => ({ id: l.id })), ...motoFrontRear.map((l) => ({ id: l.id }))],
        },
        isCommon: true,
        sortOrder: 1,
        nameKey: 'maintenance.parts.shock_absorber',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'power_steering_fluid',
        categoryId: cat_suspension_and_steering.id,
        vehicleTypes: { connect: [{ id: car.id }] },
        isCommon: true,
        sortOrder: 2,
        nameKey: 'maintenance.parts.power_steering_fluid',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'tie_rod_end',
        categoryId: cat_suspension_and_steering.id,
        vehicleTypes: { connect: [{ id: car.id }] },
        validLocations: { connect: [{ id: car_front.id }] },
        isCommon: false,
        sortOrder: 3,
        nameKey: 'maintenance.parts.tie_rod_end',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'control_arm',
        categoryId: cat_suspension_and_steering.id,
        vehicleTypes: { connect: [{ id: car.id }] },
        validLocations: { connect: [{ id: car_front.id }] },
        isCommon: false,
        sortOrder: 4,
        nameKey: 'maintenance.parts.control_arm',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'suspension_and_steering_other',
        categoryId: cat_suspension_and_steering.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: false,
        sortOrder: 999,
        nameKey: 'maintenance.parts.suspension_and_steering_other',
      },
    });

    // Category - Tires & Wheels
    await tx.vehiclePart.create({
      data: {
        code: 'tire',
        categoryId: cat_tires_and_wheels.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        validLocations: {
          connect: [...carWheelLocs.map((l) => ({ id: l.id })), ...motoFrontRear.map((l) => ({ id: l.id }))],
        },
        isCommon: true,
        sortOrder: 1,
        nameKey: 'maintenance.parts.tire',
      },
    });

    await tx.vehiclePart.create({
      data: {
        code: 'tire_rotation',
        categoryId: cat_tires_and_wheels.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: true,
        sortOrder: 3,
        nameKey: 'maintenance.parts.tire_rotation',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'wheel_alignment',
        categoryId: cat_tires_and_wheels.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: true,
        sortOrder: 4,
        nameKey: 'maintenance.parts.wheel_alignment',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'wheel_bearing',
        categoryId: cat_tires_and_wheels.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        validLocations: {
          connect: [...carWheelLocs.map((l) => ({ id: l.id })), ...motoFrontRear.map((l) => ({ id: l.id }))],
        },
        isCommon: false,
        sortOrder: 5,
        nameKey: 'maintenance.parts.wheel_bearing',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'tires_and_wheels_other',
        categoryId: cat_tires_and_wheels.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        validLocations: {
          connect: [...carWheelLocs.map((l) => ({ id: l.id })), ...motoFrontRear.map((l) => ({ id: l.id }))],
        },
        isCommon: false,
        sortOrder: 999,
        nameKey: 'maintenance.parts.tires_and_wheels_other',
      },
    });

    // Category - Electrical & Electronics
    await tx.vehiclePart.create({
      data: {
        code: 'battery',
        categoryId: cat_electrical_electronics.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 1,
        nameKey: 'maintenance.parts.battery',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'alternator',
        categoryId: cat_electrical_electronics.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }] },
        isCommon: false,
        sortOrder: 2,
        nameKey: 'maintenance.parts.alternator',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'starter_motor',
        categoryId: cat_electrical_electronics.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }] },
        isCommon: false,
        sortOrder: 3,
        nameKey: 'maintenance.parts.starter_motor',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'headlight_bulb',
        categoryId: cat_electrical_electronics.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        validLocations: { connect: [{ id: car_front.id }, { id: moto_front.id }] },
        isCommon: true,
        sortOrder: 4,
        nameKey: 'maintenance.parts.headlight_bulb',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'taillight_bulb',
        categoryId: cat_electrical_electronics.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        validLocations: { connect: [{ id: car_rear.id }, { id: moto_rear.id }] },
        isCommon: true,
        sortOrder: 5,
        nameKey: 'maintenance.parts.taillight_bulb',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'fuse',
        categoryId: cat_electrical_electronics.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 6,
        nameKey: 'maintenance.parts.fuse',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'abs_sensor',
        categoryId: cat_electrical_electronics.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        validLocations: {
          connect: [...carWheelLocs.map((l) => ({ id: l.id })), ...motoFrontRear.map((l) => ({ id: l.id }))],
        },
        isCommon: false,
        sortOrder: 7,
        nameKey: 'maintenance.parts.abs_sensor',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'electrical_electronics_other',
        categoryId: cat_electrical_electronics.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        validLocations: {
          connect: [...carWheelLocs.map((l) => ({ id: l.id })), ...motoFrontRear.map((l) => ({ id: l.id }))],
        },
        isCommon: false,
        sortOrder: 999,
        nameKey: 'maintenance.parts.electrical_electronics_other',
      },
    });

    // Category - HVAC
    await tx.vehiclePart.create({
      data: {
        code: 'ac_recharge',
        categoryId: cat_hvac.id,
        vehicleTypes: { connect: [{ id: car.id }] },
        isCommon: true,
        sortOrder: 1,
        nameKey: 'maintenance.parts.ac_recharge',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'ac_compressor',
        categoryId: cat_hvac.id,
        vehicleTypes: { connect: [{ id: car.id }] },
        isCommon: false,
        sortOrder: 2,
        nameKey: 'maintenance.parts.ac_compressor',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'blower_motor',
        categoryId: cat_hvac.id,
        vehicleTypes: { connect: [{ id: car.id }] },
        isCommon: false,
        sortOrder: 3,
        nameKey: 'maintenance.parts.blower_motor',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'cabin_air_filter',
        categoryId: cat_hvac.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 4,
        nameKey: 'maintenance.parts.cabin_air_filter',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'hvac_other',
        categoryId: cat_hvac.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 4,
        nameKey: 'maintenance.parts.hvac_other',
      },
    });

    // Category - Fluids & Filters

    await tx.vehiclePart.create({
      data: {
        code: 'air_filter',
        categoryId: cat_fluids_and_filters.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }] },
        isCommon: true,
        sortOrder: 3,
        nameKey: 'maintenance.parts.air_filter',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'windshield_washer_fluid',
        categoryId: cat_fluids_and_filters.id,
        vehicleTypes: { connect: [{ id: car.id }] },
        isCommon: true,
        sortOrder: 4,
        nameKey: 'maintenance.parts.windshield_washer_fluid',
      },
    });

    await tx.vehiclePart.create({
      data: {
        code: 'fluids_and_filters_other',
        categoryId: cat_fluids_and_filters.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 999,
        nameKey: 'maintenance.parts.fluids_and_filters_other',
      },
    });

    // Category - Body & Exterior
    await tx.vehiclePart.create({
      data: {
        code: 'wiper_blades',
        categoryId: cat_body_exterior.id,
        vehicleTypes: { connect: [{ id: car.id }] },
        validLocations: { connect: [{ id: car_front.id }] },
        isCommon: true,
        sortOrder: 1,
        nameKey: 'maintenance.parts.wiper_blades',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'car_wash',
        categoryId: cat_body_exterior.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: true,
        sortOrder: 2,
        nameKey: 'maintenance.parts.car_wash',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'wax_polish',
        categoryId: cat_body_exterior.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: false,
        sortOrder: 3,
        nameKey: 'maintenance.parts.wax_polish',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'rust_repair',
        categoryId: cat_body_exterior.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: false,
        sortOrder: 4,
        nameKey: 'maintenance.parts.rust_repair',
      },
    });
    await tx.vehiclePart.create({
      data: {
        code: 'body_exterior_other',
        categoryId: cat_body_exterior.id,
        vehicleTypes: { connect: [{ id: car.id }, { id: motorcycle.id }, { id: boat.id }, { id: other.id }] },
        isCommon: false,
        sortOrder: 999,
        nameKey: 'maintenance.parts.body_exterior_other',
      },
    });

    console.log('✅ Seeding vehicle parts completed.');
  }); // end transaction
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
