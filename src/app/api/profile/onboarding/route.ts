import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { encryptAPIKey } from "@/lib/api-key-encryption";
import { log } from "@/lib/logger";
import { z } from "zod";

const OnboardingPayloadSchema = z.object({
  useCase: z.string().optional(),
  hasOwnKeys: z.boolean().optional(),
  apiKeys: z.record(z.string(), z.string()).optional(),
  completedFirstSearch: z.boolean().optional(),
  onboardingComplete: z.boolean().optional(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = OnboardingPayloadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid onboarding payload", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { useCase, apiKeys, onboardingComplete = true } = validation.data;

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

    // Persist to Profile in MongoDB
    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        useCase: useCase || null,
        onboardingStep: 5,
        onboardingComplete: onboardingComplete,
      },
      update: {
        useCase: useCase || undefined,
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
