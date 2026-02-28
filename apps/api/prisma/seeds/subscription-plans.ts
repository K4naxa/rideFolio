import { Prisma } from 'prisma/generated/client';

export async function seedSubscriptionPlans(tx: Prisma.TransactionClient): Promise<void> {
  console.log(' Seeding subscription plans...');

  const SUBSCRIPTION_PLANS: Prisma.SubscriptionPlanCreateInput[] = [
    {
      code: 'FREE',
      nameKey: 'subscription.plans.free',
      priceCents: 0,
      currency: 'EUR',
      interval: 'MONTH',
      maxStorageBytes: 1024 * 1024, // 1 MB
      maxVehicles: 1,
    },
    {
      code: 'ENTHUSIAST',
      nameKey: 'subscription.plans.enthusiast',
      priceCents: 299, // 2.99 EUR
      currency: 'EUR',
      interval: 'MONTH',

      maxStorageBytes: 100 * 1024 * 1024, // 100 MB
      maxVehicles: 5,
    },
    {
      code: 'PRO',
      nameKey: 'subscription.plans.pro',
      priceCents: 599, // 5.99 EUR
      currency: 'EUR',
      interval: 'MONTH',
      maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10 GB
      maxVehicles: 20,
    },
    {
      code: 'ADMIN',
      nameKey: 'subscription.plans.admin',
      priceCents: 0,
      currency: 'EUR',
      interval: 'MONTH',
      maxStorageBytes: -1, // Unlimited
      maxVehicles: -1, // Unlimited
      isPublic: false,
    },
  ];

  for (const plan of SUBSCRIPTION_PLANS) {
    await tx.subscriptionPlan.upsert({
      where: { code: plan.code },
      create: plan,
      update: plan,
    });
  }

  console.log('✅ subscription plans seeded');
}
