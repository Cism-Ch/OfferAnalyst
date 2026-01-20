import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

/**
 * Better-Auth configuration.
 *
 * Uses Prisma adapter for MongoDB persistence.
 * Configured for a hybrid model: public research, private persistence.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  // Future expansion: Social providers
});
