import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { EmailService } from 'src/email/email.service';

import { prisma } from 'src/lib/prisma';

export const createAuth = (emailService: EmailService) => {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: true,
      // process.env.NODE_ENV === 'production'
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
    emailVerification: {
      autoSignInAfterVerification: true,
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
    plugins: [
      emailOTP({
        // Replace link-based email verification with OTP-based flow
        overrideDefaultEmailVerification: true,
        otpLength: 6,
        expiresIn: 600, // 10 minutes
        sendVerificationOTP: async ({ email, otp, type }) => {
          if (type === 'email-verification') {
            await emailService.sendOtpVerificationEmail({ userEmail: email, otp });
          }
        },
      }),
    ],

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
