/**
 * Prisma Client Singleton (Prisma 7 + @prisma/adapter-pg for Supabase PostgreSQL)
 *
 * Uses PrismaPg driver adapter with a singleton pg.Pool in development
 * to prevent connection exhaustion across Next.js hot-reloads.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

const pgPool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString,
    max: process.env.NODE_ENV === 'production' ? 10 : 5,
  });

const adapter = new PrismaPg(pgPool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pgPool = pgPool;
  globalForPrisma.prisma = prisma;
}

export default prisma;
