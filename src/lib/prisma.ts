/**
 * Prisma Client Singleton
 * 
 * This file provides a singleton instance of PrismaClient to prevent
 * multiple instances during hot-reloading in development.
 * 
 * In production, we create a new client each time.
 * In development, we reuse the same client across hot-reloads.
 * 
 * Note: Prisma 7 with MongoDB - pass database URL directly to client constructor
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Get database URL from environment or use default
const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/offeranalyst';

// Create Prisma client with database URL for Prisma 7
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
