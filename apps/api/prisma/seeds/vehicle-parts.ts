import type { VehicleTypesResult } from './vehicle-types';
import type { VehiclePartLocationsResult } from './vehicle-part-locations';
import type { MaintenanceCategoriesResult } from './maintenance-categories';
import { Prisma } from 'prisma/generated/client';

export async function seedVehicleParts(
  tx: Prisma.TransactionClient,
  vehicleTypes: VehicleTypesResult,
  locations: VehiclePartLocationsResult,
  categories: MaintenanceCategoriesResult,
): Promise<void> {
  console.log('🔩 Seeding vehicle parts...');

  const { car, motorcycle, boat, other } = vehicleTypes;
  const { car_front, car_rear, moto_front, moto_rear, carWheelLocs, motoFrontRear } = locations;
  const {
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
  } = categories;

  // ================================================================
  // CATEGORY: ENGINE
  // ================================================================
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

  // ================================================================
  // CATEGORY: TRANSMISSION & DRIVETRAIN
  // ================================================================
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

  // ================================================================
  // CATEGORY: COOLING SYSTEMS
  // ================================================================
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

  // ================================================================
  // CATEGORY: FUEL SYSTEMS
  // ================================================================
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

  // ================================================================
  // CATEGORY: EXHAUST & EMISSIONS
  // ================================================================
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

  // ================================================================
  // CATEGORY: BRAKES
  // ================================================================
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

  // ================================================================
  // CATEGORY: SUSPENSION & STEERING
  // ================================================================
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

  // ================================================================
  // CATEGORY: TIRES & WHEELS
  // ================================================================
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

  // ================================================================
  // CATEGORY: ELECTRICAL & ELECTRONICS
  // ================================================================
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

  // ================================================================
  // CATEGORY: HVAC
  // ================================================================
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

  // ================================================================
  // CATEGORY: FLUIDS & FILTERS
  // ================================================================
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

  // ================================================================
  // CATEGORY: BODY & EXTERIOR
  // ================================================================
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

  console.log('✅ Vehicle parts seeded');
}
