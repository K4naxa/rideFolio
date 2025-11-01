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
    autoSignIn: true,
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
    disabled: false,
  },
  onAPIError: {
    throw: true,
    onError: (error) => {
      // Custom error handling
      console.error('Auth error:', error);
    },
    errorURL: '/auth/error',
  },

  // TODO: change these to configService for production use
  baseURL: process.env.BACKEND_URL || 'http://localhost:3001',
  trustedOrigins: process.env.NODE_ENV === 'production' ? [process.env.FRONTEND_URL || 'http://localhost:5173'] : ['*'], // Allow all origins in development
  basePath: '/api/auth',
});
