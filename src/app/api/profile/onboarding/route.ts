import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { encryptAPIKey } from "@/lib/api-key-encryption";
import { log } from "@/lib/logger";
import { z } from "zod";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { normalizeCountryCode } from "@/lib/geo";

const OnboardingPayloadSchema = z.object({
  useCase: z.string().trim().max(100).optional(),
  country: z.string().trim().max(10).optional(),
  hasOwnKeys: z.boolean().optional(),
  apiKeys: z
    .record(
      z.string().trim().min(1).max(32).regex(/^[a-z0-9_-]+$/i, "Invalid provider identifier"),
      z.string().trim().max(512)
    )
    .refine((obj) => Object.keys(obj).length <= 10, "Maximum 10 API keys allowed")
    .optional(),
  completedFirstSearch: z.boolean().optional(),
  onboardingComplete: z.boolean().optional(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIdentifier(request);
    const rateLimitResult = rateLimit(`onboarding:${clientIp}`, {
      max: 15,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = OnboardingPayloadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid onboarding payload", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { useCase, country, apiKeys, onboardingComplete = true } = validation.data;
    const normalizedCountry = normalizeCountryCode(country);

    // Check user session
    let userId: string | undefined;
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      userId = session?.user?.id;
    } catch {
      // Session unavailable
    }

    if (!userId) {
      // Guest or unauthenticated onboarding: return successful acknowledgment
      log.info("Onboarding completed for guest user session", { useCase });
      return NextResponse.json({
        success: true,
        guest: true,
        message: "Onboarding completed in guest mode",
      });
    }

    // Persist to Profile in Supabase PostgreSQL
    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        useCase: useCase || null,
        country: normalizedCountry,
        onboardingStep: 5,
        onboardingComplete: onboardingComplete,
      },
      update: {
        useCase: useCase || undefined,
        country: country ? normalizedCountry : undefined,
        onboardingStep: 5,
        onboardingComplete: onboardingComplete,
      },
    });

    // If user configured BYOK keys during onboarding, encrypt and store them
    if (apiKeys && Object.keys(apiKeys).length > 0) {
      for (const [provider, key] of Object.entries(apiKeys)) {
        if (!key || typeof key !== "string" || key.trim() === "") continue;

        const trimmedKey = key.trim();
        const encrypted = encryptAPIKey(trimmedKey);
        const preview = trimmedKey.slice(-4);

        await prisma.aPIKey.create({
          data: {
            userId,
            name: `${provider.toUpperCase()} Key`,
            provider: provider.toLowerCase(),
            keyEncrypted: encrypted,
            keyPreview: preview,
            isActive: true,
            isPrimary: true,
          },
        }).catch((keyErr) => {
          log.warn("Failed to persist onboarding API key", { provider, error: String(keyErr) });
        });
      }
    }

    log.info("Onboarding profile saved successfully", { userId, useCase });

    return NextResponse.json({
      success: true,
      message: "Onboarding profile successfully saved",
    });
  } catch (error) {
    log.error("Failed to save onboarding profile", error);
    return NextResponse.json(
      { error: "Internal server error occurred while saving profile" },
      { status: 500 }
    );
  }
}
