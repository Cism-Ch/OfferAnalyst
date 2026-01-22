/**
 * Prisma Client Singleton
 * 
 * This file provides a singleton instance of PrismaClient to prevent
 * multiple instances during hot-reloading in development.
 * 
 * In production, we create a new client each time.
 * In development, we reuse the same client across hot-reloads.
 * 
 * Note: Prisma 7 with MongoDB - the connection string is configured in prisma.config.ts
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client without extra configuration for Prisma 7
// The connection is managed through prisma.config.ts
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
