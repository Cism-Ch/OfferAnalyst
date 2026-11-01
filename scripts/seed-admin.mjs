/**
 * Database Admin Seeding Script (Idempotent)
 * 
 * Safely provisions the administrator user in MongoDB based on
 * ADMIN_EMAIL and ADMIN_PASSWORD configured in .env.
 * Ensures the user has role: "ADMIN" and emailVerified: true.
 * 
 * Usage:
 *   pnpm run db:seed-admin
 */

import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  secret: process.env.BETTER_AUTH_SECRET || "development-secret-change-in-production-1234567890",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
      },
    },
  },
  advanced: {
    cookiePrefix: "offeranalyst",
    database: {
      validateSchema: false,
      generateId: false,
    },
  },
});

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME?.trim() || "Admin OfferAnalyst";

  if (!adminEmail || !adminPassword) {
    console.error("Error: ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env");
    process.exit(1);
  }

  console.log(`Checking existing account for admin: ${adminEmail}...`);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log(`User ${adminEmail} already exists (ID: ${existingUser.id}). Ensuring role: ADMIN...`);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: "ADMIN",
          emailVerified: true,
        },
      });
      console.log("Admin user successfully synchronized with ADMIN role.");
    } else {
      console.log(`Admin user does not exist. Provisioning via Better-Auth...`);
      const res = await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: adminName,
        },
      });

      if (!res?.user?.id) {
        throw new Error("Better-Auth did not return a valid user ID during admin creation.");
      }

      await prisma.user.update({
        where: { id: res.user.id },
        data: {
          role: "ADMIN",
          emailVerified: true,
        },
      });

      console.log(`Admin user successfully created with ID: ${res.user.id} and role: ADMIN!`);
    }
  } catch (err) {
    console.error("Failed to seed admin:", err?.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();

