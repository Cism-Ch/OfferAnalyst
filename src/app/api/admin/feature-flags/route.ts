import { NextRequest, NextResponse } from "next/server";
import { getFeatureFlags, updateFeatureFlag, FeatureFlags } from "@/lib/feature-flags";
import { log } from "@/lib/logger";
import { z } from "zod";

const UpdateFlagSchema = z.object({
  flag: z.enum([
    "fetchV2",
    "organizeV2",
    "dualWorkflow",
    "newAnalytics",
    "enableWebhooks",
    "enableCache",
  ]),
  enabled: z.boolean(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const flags = getFeatureFlags();
  return NextResponse.json({ flags });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = UpdateFlagSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid feature flag payload", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { flag, enabled } = validation.data;
    const updatedFlags = updateFeatureFlag(flag as keyof FeatureFlags, enabled);

    log.info("Feature flag updated", { flag, enabled });

    return NextResponse.json({
      success: true,
      flags: updatedFlags,
    });
  } catch (error) {
    log.error("Failed to update feature flag", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
