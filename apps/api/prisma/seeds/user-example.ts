import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { VehiclesService } from '../../src/vehicles/vehicles.service';
import { NoteService } from '../../src/note/note.service';
import { TodosService } from '../../src/todos/todos.service';
import { ShoppingListService } from '../../src/shopping-list/shopping-list.service';
import { RefillsService } from '../../src/logs/refills.service';
import { MaintenanceService } from '../../src/logs/maintenance/maintenance.service';
import { QuicklinksService } from '../../src/quicklinks/quicklinks.service';
import { UserSession } from '@thallesp/nestjs-better-auth';
import * as bcrypt from 'bcrypt';

interface VehicleData {
  id: string;
  name: string;
  odometerType: 'KILOMETER' | 'HOUR';
}

export async function seedUser1() {
  console.log('🌱 Starting user1 seed...\n');

  // Bootstrap NestJS app to get services
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const prisma = app.get(PrismaService);
  const vehiclesService = app.get(VehiclesService);
  const noteService = app.get(NoteService);
  const todosService = app.get(TodosService);
  const shoppingListService = app.get(ShoppingListService);
  const refillsService = app.get(RefillsService);
  const maintenanceService = app.get(MaintenanceService);
  const quicklinksService = app.get(QuicklinksService);

  try {
    // 1. Create user with hashed password
    console.log('👤 Creating user1...');
    const hashedPassword = await bcrypt.hash('password', 10);

    const freePlan = await prisma.subscriptionPlan.findUnique({
      where: { code: 'FREE' },
    });

    if (!freePlan) {
      throw new Error('FREE subscription plan not found');
    }

    const user = await prisma.user.create({
      data: {
        name: 'User One',
        email: 'user@example.com',
        emailVerified: true,
        image:
          'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        planId: freePlan.id,
        maxStorageBytes: Number(freePlan.maxStorageBytes),
      },
    });

    // Create account entry for email/password auth
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: hashedPassword,
      },
    });

    console.log(`✅ User created: ${user.email}`);

    // Mock UserSession for service calls
    const mockSession: UserSession = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: user.role,
      },
      session: {
        id: 'seed-session',
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        token: 'seed-token',
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    // 2. Create vehicles
    console.log('\n🚗 Creating vehicles...');

    const vehicles: VehicleData[] = [];

    // Vehicle 1: Porsche 911
    const porsche = await vehiclesService.create(mockSession, {
      name: 'Possu',
      make: 'Porsche',
      model: '911',
      type: 'CAR',
      year: 2024,
      odometer: 5000,
      odometerType: 'KILOMETER',
      fuelType: 'GASOLINE',
      image: null,
      vin: null,
      licensePlate: null,
    });
    vehicles.push({ id: porsche.newVehicleId, name: 'Possu', odometerType: 'KILOMETER' });

    // Update Porsche image directly in DB
    await prisma.vehicle.update({
      where: { id: porsche.newVehicleId },
      data: {
        image:
          'https://images.ctfassets.net/tcksz0bgkenw/3JRXWv0PCAqOfmmZ7YJGa0/eb168827dab034ba76367773257ac3f2/911_Carrera_GTS',
      },
    });

    console.log(`  ✅ Created Porsche 911: ${porsche.newVehicleId}`);

    // Vehicle 2: BMW F900R Motorcycle
    const bmw = await vehiclesService.create(mockSession, {
      name: 'Beemer',
      make: 'BMW',
      model: 'F900R',
      type: 'MOTORCYCLE',
      year: 2021,
      odometer: 8500,
      odometerType: 'KILOMETER',
      fuelType: 'GASOLINE',
      image: null,
      vin: null,
      licensePlate: null,
    });
    vehicles.push({ id: bmw.newVehicleId, name: 'Beemer', odometerType: 'KILOMETER' });

    // Update BMW image
    await prisma.vehicle.update({
      where: { id: bmw.newVehicleId },
      data: {
        image:
          'https://www.bmwmotorrad.com.ph/content/dam/bmwmotorradnsc/marketPH_IMPORTER/bmwmotorrad_com_ph/ph-assets/multiimages/HomeBanner/F900RMarch23.jpg.asset.1732616655027.jpg',
      },
    });

    console.log(`  ✅ Created BMW F900R: ${bmw.newVehicleId}`);

    // Vehicle 3: Fishing Boat
    const boat = await vehiclesService.create(mockSession, {
      name: 'Sea Wanderer',
      make: 'Yamaha',
      model: 'AR190',
      type: 'BOAT',
      year: 2022,
      odometer: 125,
      odometerType: 'HOUR',
      fuelType: 'GASOLINE',
      image: null,
      vin: null,
      licensePlate: null,
    });
    vehicles.push({ id: boat.newVehicleId, name: 'Sea Wanderer', odometerType: 'HOUR' });

    // Update Boat image
    await prisma.vehicle.update({
      where: { id: boat.newVehicleId },
      data: {
        image: 'https://www.southernformula.com.au/wp-content/uploads/2023/11/fishing-boats-banner-1920x1000.jpeg',
      },
    });

    console.log(`  ✅ Created Fishing Boat: ${boat.newVehicleId}`);

    // 3. Create Notes for each vehicle
    console.log('\n📝 Creating notes...');

    // Porsche Notes
    const porscheNotes = [
      {
        title: 'Performance Upgrade Plan',
        content:
          'Planning to install a stage 2 ECU tune. Should increase power to around 450hp. Need to budget for supporting mods like intercooler upgrade and exhaust system.',
        tags: ['performance', 'upgrades', 'tuning'],
      },
      {
        title: 'Track Day Setup',
        content:
          'Tire pressure: Front 32 PSI, Rear 34 PSI for track use. Remove spare tire and tools to save weight. Bring torque wrench and tire gauge.',
        tags: ['track', 'setup', 'tires'],
      },
      {
        title: 'Winter Storage Checklist',
        content:
          'Full tank with fuel stabilizer, battery tender, cover car, inflate tires to 40 PSI. Clean thoroughly before storage.',
        tags: ['maintenance', 'winter', 'storage'],
      },
      {
        title: 'Insurance renewal reminder',
        content: 'Insurance policy expires March 15th. Get quotes from multiple providers. Current premium: €1850/year.',
        tags: ['insurance', 'admin'],
      },
      {
        title: 'Favorite driving routes',
        content:
          'Route 1: Mountain pass via Highway 7 - amazing twisties. Route 2: Coastal road to Turku. Route 3: Forest roads north of Helsinki.',
        tags: ['routes', 'driving'],
      },
    ];

    for (const noteData of porscheNotes) {
      await noteService.createNote(mockSession, {
        vehicleId: porsche.newVehicleId,
        ...noteData,
        pinned: noteData.title === 'Track Day Setup',
      });
    }
    console.log(`  ✅ Created ${porscheNotes.length} notes for Porsche`);

    // BMW Motorcycle Notes
    const bmwNotes = [
      {
        title: 'Riding Gear Maintenance',
        content:
          'Clean helmet visor. Treat leather jacket with conditioner. Check glove stitching. Wash riding jeans.',
        tags: ['gear', 'maintenance'],
      },
      {
        title: 'Summer Tour Planning',
        content:
          'Route: Helsinki -> Tampere -> Oulu -> Rovaniemi. 5 days, camping along the way. Book campsites in advance. Total distance: ~1100 km.',
        tags: ['tour', 'travel', 'planning'],
      },
      {
        title: 'Chain maintenance schedule',
        content: 'Clean and lube chain every 500km. Current chain has 12,000km. Replace at 20,000km. Use DID 520 chain.',
        tags: ['maintenance', 'chain'],
      },
      {
        title: 'Suspension settings',
        content:
          'Current setup: Preload 3/7, Compression 12 clicks out, Rebound 10 clicks out. Weight: 85kg + 10kg gear. Feels good on highway.',
        tags: ['suspension', 'setup'],
      },
    ];

    for (const noteData of bmwNotes) {
      await noteService.createNote(mockSession, {
        vehicleId: bmw.newVehicleId,
        ...noteData,
        pinned: false,
      });
    }
    console.log(`  ✅ Created ${bmwNotes.length} notes for BMW`);

    // Boat Notes
    const boatNotes = [
      {
        title: 'Fishing Spots',
        content:
          'Spot 1: Rocky bay near lighthouse - pike and perch. Spot 2: Deep channel near island - zander. Spot 3: Shallow weeds - pike.',
        tags: ['fishing', 'locations'],
      },
      {
        title: 'Safety Equipment Check',
        content:
          'Life jackets: 6 total, all in good condition. Flares expire 2027. Fire extinguisher serviced. First aid kit complete.',
        tags: ['safety', 'equipment'],
      },
      {
        title: 'Winterization procedure',
        content:
          'Drain all water systems. Fog engine. Stabilize fuel. Remove batteries and store indoors. Cover boat. Check in monthly.',
        tags: ['maintenance', 'winter'],
      },
      {
        title: 'Best fishing days',
        content:
          'Pike: early morning and late evening. Perch: midday. Zander: dusk and dawn. Best months: May-June and September-October.',
        tags: ['fishing', 'tips'],
      },
      {
        title: 'Marina fees',
        content: 'Summer dock: €1200/season. Winter storage: €800. Launch/retrieve: €150 each. Total: €2300/year.',
        tags: ['costs', 'marina'],
      },
      {
        title: 'Maintenance contact',
        content: 'Boat mechanic: Jari at Marine Service Oy. Phone: +358 40 123 4567. Good rates, reliable work.',
        tags: ['contacts', 'service'],
      },
    ];

    for (const noteData of boatNotes) {
      await noteService.createNote(mockSession, {
        vehicleId: boat.newVehicleId,
        ...noteData,
        pinned: noteData.title === 'Fishing Spots',
      });
    }
    console.log(`  ✅ Created ${boatNotes.length} notes for Boat`);

    // 4. Create Maintenances
    console.log('\n🔧 Creating maintenance records...');

    // Get maintenance parts first
    const categories = await maintenanceService.getCategoriesWithParts('CAR');
    const brakePart = categories
      .find((c) => c.code === 'BRAKES')
      ?.parts.find((p) => p.code === 'BRAKE_PADS_FRONT');
    const suspensionPart = categories
      .find((c) => c.code === 'SUSPENSION')
      ?.parts.find((p) => p.code === 'SHOCK_ABSORBER');

    if (brakePart) {
      await maintenanceService.createMaintenance(mockSession, {
        vehicleId: porsche.newVehicleId,
        date: new Date('2025-11-20'),
        odometer: 4200,
        title: 'Performance Brake Upgrade',
        serviceProvider: 'AutoExpert Oy',
        parts: [
          {
            partId: brakePart.id,
            partCode: brakePart.code,
            partNameKey: brakePart.nameKey,
            groupId: brakePart.id,
            categoryCode: 'BRAKES',
            categoryNameKey: 'BRAKES',
            customName: 'Brembo GT-S Big Brake Kit',
            label: 'Front',
            description: 'Upgraded to 6-piston calipers with 380mm rotors',
            locations: brakePart.validLocations,
          },
        ],
        totalCost: 4500,
        notes: 'Massive improvement in braking performance. Pedal feel is much better.',
        image: null,
      });
      console.log('  ✅ Created brake upgrade maintenance for Porsche');
    }

    if (suspensionPart) {
      await maintenanceService.createMaintenance(mockSession, {
        vehicleId: porsche.newVehicleId,
        date: new Date('2025-12-10'),
        odometer: 4850,
        title: 'Suspension Upgrade',
        serviceProvider: 'Performance Parts Finland',
        parts: [
          {
            partId: suspensionPart.id,
            partCode: suspensionPart.code,
            partNameKey: suspensionPart.nameKey,
            groupId: suspensionPart.id,
            categoryCode: 'SUSPENSION',
            categoryNameKey: 'SUSPENSION',
            customName: 'KW V3 Coilovers',
            label: 'Full Set',
            description: 'Height adjustable coilover suspension with adjustable damping',
            locations: [],
          },
        ],
        totalCost: 3200,
        notes: 'Lowered by 30mm. Much better handling on track. Slightly stiffer for daily driving.',
        image: null,
      });
      console.log('  ✅ Created suspension upgrade maintenance for Porsche');
    }

    // BMW Maintenance
    const motorcycleCategories = await maintenanceService.getCategoriesWithParts('MOTORCYCLE');
    const oilPart = motorcycleCategories.find((c) => c.code === 'ENGINE')?.parts.find((p) => p.code === 'ENGINE_OIL');

    if (oilPart) {
      await maintenanceService.createMaintenance(mockSession, {
        vehicleId: bmw.newVehicleId,
        date: new Date('2026-01-15'),
        odometer: 8200,
        title: 'Annual Service',
        serviceProvider: 'BikeTeam Oy',
        parts: [
          {
            partId: oilPart.id,
            partCode: oilPart.code,
            partNameKey: oilPart.nameKey,
            groupId: oilPart.id,
            categoryCode: 'ENGINE',
            categoryNameKey: 'ENGINE',
            customName: null,
            label: null,
            description: 'Engine oil and filter change, valve clearance check',
            locations: [],
          },
        ],
        totalCost: 450,
        notes: 'Full annual service completed. All checks passed. Valve clearances within spec.',
        image: null,
      });
      console.log('  ✅ Created annual maintenance for BMW');
    }

    // 5. Create Todos
    console.log('\n✅ Creating todos...');

    // Porsche Todos
    await todosService.createTodo(mockSession, {
      vehicleId: porsche.newVehicleId,
      title: 'Schedule dyno tuning session',
      description: 'Book appointment at PowerLab for ECU tuning. Bring previous dyno sheets.',
      priority: 'HIGH',
      dueDate: new Date('2026-03-15'),
      dueOdometer: null,
    });

    await todosService.createTodo(mockSession, {
      vehicleId: porsche.newVehicleId,
      title: 'Replace engine air filter',
      description: 'Install K&N high-flow air filter',
      priority: 'MEDIUM',
      dueDate: null,
      dueOdometer: 4500, // Past due!
    });

    await todosService.createTodo(mockSession, {
      vehicleId: porsche.newVehicleId,
      title: 'Register for track day',
      description: 'Ahvenisto track day on June 5th. Early bird discount ends April 30th.',
      priority: 'LOW',
      dueDate: new Date('2026-04-30'),
      dueOdometer: null,
    });

    console.log('  ✅ Created 3 todos for Porsche');

    // BMW Todos
    await todosService.createTodo(mockSession, {
      vehicleId: bmw.newVehicleId,
      title: 'Replace brake pads',
      description: 'Front brake pads getting thin. Order OEM or aftermarket?',
      priority: 'HIGH',
      dueDate: new Date('2026-02-20'),
      dueOdometer: 8000, // Past due!
    });

    await todosService.createTodo(mockSession, {
      vehicleId: bmw.newVehicleId,
      title: 'Check tire tread depth',
      description: 'Tires have 8000km. Should still be good but check before summer tour.',
      priority: 'MEDIUM',
      dueDate: new Date('2026-05-01'),
      dueOdometer: null,
    });

    await todosService.createTodo(mockSession, {
      vehicleId: bmw.newVehicleId,
      title: 'Install tank grips',
      description: 'New Techspec tank grips arrived. Install before next ride.',
      priority: 'LOW',
      dueDate: null,
      dueOdometer: null,
    });

    console.log('  ✅ Created 3 todos for BMW');

    // Boat Todos
    await todosService.createTodo(mockSession, {
      vehicleId: boat.newVehicleId,
      title: 'Spring commissioning',
      description:
        'Get boat ready for season: clean hull, check battery, test all systems, stock safety equipment.',
      priority: 'HIGH',
      dueDate: new Date('2026-04-15'),
      dueOdometer: null,
    });

    await todosService.createTodo(mockSession, {
      vehicleId: boat.newVehicleId,
      title: 'Replace impeller',
      description: 'Cooling system impeller should be replaced every 2 years as preventive maintenance.',
      priority: 'MEDIUM',
      dueDate: null,
      dueOdometer: 115, // Past due!
    });

    await todosService.createTodo(mockSession, {
      vehicleId: boat.newVehicleId,
      title: 'Renew boat license',
      description: 'Boat registration renewal due. Pay online before expiry.',
      priority: 'HIGH',
      dueDate: new Date('2026-05-31'),
      dueOdometer: null,
    });

    await todosService.createTodo(mockSession, {
      vehicleId: boat.newVehicleId,
      title: 'Install new fish finder',
      description: 'New Garmin Echomap ordered. Install and configure before fishing season.',
      priority: 'LOW',
      dueDate: new Date('2026-05-01'),
      dueOdometer: null,
    });

    console.log('  ✅ Created 4 todos for Boat');

    // 6. Create Shopping List Items
    console.log('\n🛒 Creating shopping list items...');

    // Porsche Shopping List
    const porscheShoppingItems = [
      { name: 'Ceramic coating kit', price: 120 },
      { name: 'Microfiber towels (pack of 10)', price: 25 },
      { name: 'Track day brake fluid (Motul RBF660)', price: 45 },
      { name: 'Wheel cleaner', price: 18 },
      { name: 'Paint correction compounds', price: 85 },
      { name: 'Tire pressure gauge digital', price: 35 },
      { name: 'OBD2 scanner tool', price: 150 },
    ];

    for (const item of porscheShoppingItems) {
      await shoppingListService.createItem(mockSession, {
        vehicleId: porsche.newVehicleId,
        ...item,
        isPurchased: false,
      });
    }
    console.log(`  ✅ Created ${porscheShoppingItems.length} shopping items for Porsche`);

    // BMW Shopping List
    const bmwShoppingItems = [
      { name: 'Chain cleaning brush', price: 12 },
      { name: 'Chain lube (X-ring)', price: 18 },
      { name: 'Brake pads front', price: 95 },
      { name: 'Engine oil 10W-40 (4L)', price: 45 },
      { name: 'Oil filter', price: 15 },
      { name: 'Tank bag mount', price: 55 },
      { name: 'Heated grips', price: 85 },
      { name: 'Phone mount for handlebar', price: 32 },
      { name: 'Auxiliary LED lights', price: 120 },
    ];

    for (const item of bmwShoppingItems) {
      await shoppingListService.createItem(mockSession, {
        vehicleId: bmw.newVehicleId,
        ...item,
        isPurchased: false,
      });
    }
    console.log(`  ✅ Created ${bmwShoppingItems.length} shopping items for BMW`);

    // Boat Shopping List
    const boatShoppingItems = [
      { name: 'Life jacket (adult)', price: 65 },
      { name: 'Anchor chain (10m)', price: 85 },
      { name: 'Bilge pump backup', price: 120 },
      { name: 'Fenders (set of 4)', price: 95 },
      { name: 'Dock lines (4x 15m)', price: 60 },
      { name: 'Navigation lights LED upgrade', price: 150 },
      { name: 'Fishing rod holder', price: 45 },
      { name: 'Boat cover (winter)', price: 280 },
      { name: 'Marine battery charger', price: 95 },
      { name: 'Fuel stabilizer', price: 22 },
    ];

    for (const item of boatShoppingItems) {
      await shoppingListService.createItem(mockSession, {
        vehicleId: boat.newVehicleId,
        ...item,
        isPurchased: false,
      });
    }
    console.log(`  ✅ Created ${boatShoppingItems.length} shopping items for Boat`);

    // 7. Create Refills
    console.log('\n⛽ Creating refills...');

    // Helper function to generate refills
    const createRefills = async (
      vehicleId: string,
      startDate: Date,
      intervalDays: number,
      count: number,
      startOdometer: number,
      avgConsumption: number,
      odometerIncrement: number,
      fuelAmount: number,
      pricePerLiter: number,
    ) => {
      let currentDate = new Date(startDate);
      let currentOdometer = startOdometer;

      for (let i = 0; i < count; i++) {
        const isFullRefill = Math.random() > 0.1; // 90% chance of full refill
        const consumption = avgConsumption + (Math.random() - 0.5) * avgConsumption * 0.15; // ±15% variation
        const actualFuelAmount = fuelAmount + (Math.random() - 0.5) * fuelAmount * 0.2; // ±20% variation

        await refillsService.createRefill(mockSession, {
          vehicleId,
          date: new Date(currentDate),
          odometer: currentOdometer,
          fullRefill: isFullRefill,
          skippedRefill: false,
          fuelAmount: parseFloat(actualFuelAmount.toFixed(2)),
          pricePerUnit: pricePerLiter,
          costTotal: parseFloat((actualFuelAmount * pricePerLiter).toFixed(2)),
          notes: null,
        });

        currentDate = new Date(currentDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
        currentOdometer += odometerIncrement;
      }
    };

    // Porsche 911 - Daily driver, refill every 3-4 days
    // 2024 Porsche 911: 17-23 MPG (US) = approximately 10-14 L/100km
    // Tank: ~64L, drive ~400-500km between refills
    const porscheStartDate = new Date('2025-11-01');
    const porscheRefills = Math.floor(90 / 3.5); // ~3.5 day average over 3 months
    await createRefills(
      porsche.newVehicleId,
      porscheStartDate,
      3.5, // days between refills
      porscheRefills,
      3500, // starting odometer
      12, // avg L/100km
      450, // km between refills
      55, // liters per refill
      1.65, // EUR per liter
    );
    console.log(`  ✅ Created ${porscheRefills} refills for Porsche`);

    // BMW F900R - Weekly refills
    // Motorcycle: approximately 5-6 L/100km
    // Tank: ~13L, drive ~200km between refills
    const bmwStartDate = new Date('2025-11-01');
    const bmwRefills = Math.floor(90 / 7); // weekly over 3 months
    await createRefills(
      bmw.newVehicleId,
      bmwStartDate,
      7, // days between refills
      bmwRefills,
      7000, // starting odometer
      5.5, // avg L/100km
      200, // km between refills
      11, // liters per refill
      1.65, // EUR per liter
    );
    console.log(`  ✅ Created ${bmwRefills} refills for BMW`);

    // Boat - Monthly refills (boat uses hours)
    // Boat: approximately 30-40 L/hour
    // Tank: ~200L, run ~5-6 hours between refills
    const boatStartDate = new Date('2025-11-15');
    const boatRefills = 3; // once per month for 3 months
    await createRefills(
      boat.newVehicleId,
      boatStartDate,
      30, // days between refills
      boatRefills,
      110, // starting odometer (hours)
      35, // avg L/hour
      5, // hours between refills
      180, // liters per refill
      1.70, // EUR per liter (might be slightly more expensive at marina)
    );
    console.log(`  ✅ Created ${boatRefills} refills for Boat`);

    // 8. Create Quick Links
    console.log('\n🔗 Creating quick links...');

    const quickLinks = [
      {
        name: 'Local Tire Shop',
        url: 'https://www.rengasmaailma.fi',
        description: 'Best prices on performance tires',
      },
      {
        name: 'Track Day Calendar',
        url: 'https://www.ratapaiva.fi',
        description: 'Book track days in Finland',
      },
      {
        name: 'OEM Parts Supplier',
        url: 'https://www.autodoc.fi',
        description: 'Reliable source for genuine parts',
      },
      {
        name: 'Marine Weather Forecast',
        url: 'https://www.foreca.fi/Finland/Helsinki/marine',
        description: 'Check conditions before going out',
      },
      {
        name: 'Motorcycle Forums',
        url: 'https://www.moottoripyoraily.com',
        description: 'Finnish motorcycle community',
      },
    ];

    for (const link of quickLinks) {
      await quicklinksService.createQuickLink(mockSession, link);
    }
    console.log(`  ✅ Created ${quickLinks.length} quick links`);

    console.log('\n🎉 User1 seed completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   User: ${user.email}`);
    console.log(`   Vehicles: 3 (Porsche 911, BMW F900R, Fishing Boat)`);
    console.log(`   Notes: ${porscheNotes.length + bmwNotes.length + boatNotes.length}`);
    console.log(`   Maintenances: 3`);
    console.log(`   Todos: 10`);
    console.log(
      `   Shopping Items: ${porscheShoppingItems.length + bmwShoppingItems.length + boatShoppingItems.length}`,
    );
    console.log(`   Refills: ${porscheRefills + bmwRefills + boatRefills}`);
    console.log(`   Quick Links: ${quickLinks.length}`);
  } catch (error) {
    console.error('❌ Error seeding user1:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run if executed directly
if (require.main === module) {
  seedUser1()
    .then(() => {
      console.log('✅ Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed script failed:', error);
      process.exit(1);
    });
}
