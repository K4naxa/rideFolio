import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  logger: {
    level: 'info',
  },

  // TODO: change these to configService for production use
  baseURL: process.env.BACKEND_URL || 'http://localhost:3001',
  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000'],
  basePath: '/auth',
});
