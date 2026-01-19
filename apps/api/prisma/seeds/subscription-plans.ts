import { Prisma } from 'prisma/generated/prisma/client';

export async function seedSubscriptionPlans(tx: Prisma.TransactionClient): Promise<void> {
  console.log(' Seeding Subscription plans...');

  // FREE plan
  await tx.subscriptionPlan.upsert({
    where: { code: 'FREE' },
    update: {},
    create: {
      code: 'FREE',
      nameKey: 'subscription.plans.free',
      PriceCents: 0,
      currency: 'EUR',
      interval: 'MONTH',

      storageLimitBytes: 50 * 1024 * 1024, // 50 MB
      vehicleLimit: 2,
    },
  });

  // Enthusiast plan
  await tx.subscriptionPlan.upsert({
    where: { code: 'ENTHUSIAST' },
    update: {},
    create: {
      code: 'ENTHUSIAST',
      nameKey: 'subscription.plans.enthusiast',
      PriceCents: 299, // 2.99 EUR
      currency: 'EUR',
      interval: 'MONTH',

      storageLimitBytes: 200 * 1024 * 1024, // 200 MB
      vehicleLimit: 10,
    },
  });

  // PRO plan
  await tx.subscriptionPlan.upsert({
    where: { code: 'PRO' },
    update: {},
    create: {
      code: 'PRO',
      nameKey: 'subscription.plans.pro',
      PriceCents: 599, // 5.99 EUR
      currency: 'EUR',
      interval: 'MONTH',
      storageLimitBytes: 5 * 1024 * 1024 * 1024, // 5 GB
      vehicleLimit: 50,
    },
  });

  console.log('✅ Subscription plans seeded');
}
