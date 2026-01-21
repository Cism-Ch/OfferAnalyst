import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * Ensures only one instance of Prisma Client is created,
 * preventing connection exhaustion in development.
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
