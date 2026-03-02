import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { EmailService } from 'src/email/email.service';

import { prisma } from 'src/lib/prisma';

// @ts-ignore
export const createAuth = (emailService: EmailService) => {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: process.env.NODE_ENV === 'production',
      minPasswordLength: 8,
      revokeSessionsOnPasswordReset: true,
    },
    user: {
      additionalFields: {
        planId: {
          type: 'string',
        },
        maxStorageBytes: {
          type: 'number',
        },
      },

      changeEmail: {
        enabled: true,
      },
      deleteUser: {
        enabled: true,
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            try {
              console.log('New user signed up: ', user.email);

              // Fetch FREE subscription plan
              const freePlan = await prisma.subscriptionPlan.findUnique({ where: { code: 'FREE' } });
              if (!freePlan) throw new Error('FREE subscription plan not found in database');

              return {
                data: {
                  ...user,
                  planId: freePlan.id,
                  maxStorageBytes: Number(freePlan.maxStorageBytes),
                },
              };
            } catch (error) {
              console.error('❌ Error assigning FREE subscription plan to new user:', error);
            }
          },
        },
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url, token }) => {
        void emailService.sendEmailVerification({
          user: user,
          userEmail: user.email,
          token: token,
          url: url,
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
    appName: 'RideFolio',
  });
};
