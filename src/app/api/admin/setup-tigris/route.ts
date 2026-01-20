import { NextRequest, NextResponse } from "next/server";
import { initializeTigrisIndexes } from "@/lib/db/tigris";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/setup-tigris
 *
 * Administrative route to initialize Tigris Search indexes.
 * Restricted to authenticated sessions.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await initializeTigrisIndexes();
    return NextResponse.json({
      success: true,
      message: "Tigris Search indexes initialization triggered.",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
