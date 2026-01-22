/**
 * Prisma Client Singleton
 * 
 * This file provides a singleton instance of PrismaClient to prevent
 * multiple instances during hot-reloading in development.
 * 
 * In production, we create a new client each time.
 * In development, we reuse the same client across hot-reloads.
 * 
 * Note: Prisma 7 - DATABASE_URL must be set in environment variables
 * The connection is configured through prisma.config.ts
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let _prisma: PrismaClient | undefined;

/**
 * Get Prisma client instance
 * Lazy initialization to avoid build-time errors
 */
export function getPrismaClient(): PrismaClient {
  if (!_prisma) {
    // Ensure DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      if (process.env.NODE_ENV === 'development') {
        // Use default for development
        process.env.DATABASE_URL = 'mongodb://localhost:27017/offeranalyst';
      } else {
        throw new Error('[Prisma] DATABASE_URL environment variable is not set');
      }
    }

    _prisma = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = _prisma;
    }
  }

  return _prisma;
}

// Export the lazy getter as prisma for backwards compatibility
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrismaClient()[prop as keyof PrismaClient];
  },
});

export default prisma;
