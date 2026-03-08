import { NotFoundException } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';

export async function safeDelete<T>(operation: Promise<T>): Promise<T> {
  try {
    return await operation;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundException({ code: 'NOT_FOUND_OR_ACCESS_DENIED' });
    }
    throw error;
  }
}
