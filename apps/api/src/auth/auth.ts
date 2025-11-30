import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { EmailService } from 'src/email/email.service';

const prisma = new PrismaClient();
export const createAuth = (emailService: EmailService) =>
  betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      revokeSessionsOnPasswordReset: true,
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, token }) => {
        await emailService.sendEmailVerification({
          userEmail: user.email,
          token: token,
        });
      },
    },

    session: {
      cookieCache: {
        enabled: false,
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
    trustedOrigins:
      process.env.NODE_ENV === 'production' ? [process.env.FRONTEND_URL || 'http://localhost:5173'] : ['*'], // Allow all origins in development
    basePath: '/api/auth',
  });
