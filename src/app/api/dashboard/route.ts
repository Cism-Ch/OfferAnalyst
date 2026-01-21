import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DashboardStateSchema } from "@/lib/db/schemas";
import { logAuditAction } from "@/lib/db/audit";
import { auth } from "@/lib/auth"; // Ensure this exists or use authClient/server logic
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ success: true, data: null });
    }

    const state = await prisma.dashboardState.findUnique({
      where: { userId: session.user.id },
    });

    if (!state) {
      return NextResponse.json({
        success: true,
        data: {
          id: "default",
          userId: session.user.id,
          domain: "Jobs",
          explicitCriteria: "",
          implicitContext: "",
          offersInput: "",
          limit: "3",
          model: "google/gemini-2.0-flash-exp:free",
          autoFetch: true,
        },
      });
    }

    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch dashboard state" } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate with Zod
    const validation = DashboardStateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid input data",
            details: validation.error.format(),
          },
        },
        { status: 400 },
      );
    }

    // Basic validation for the upsert
    const upsertData = {
      domain: body.domain || "General",
      explicitCriteria: body.explicitCriteria || "",
      implicitContext: body.implicitContext || "",
      offersInput: body.offersInput || "",
      autoFetch: !!body.autoFetch,
      limit: String(body.limit || "3"),
      model: body.model || "google/gemini-2.0-flash-exp:free",
      userId: session.user.id,
    };

    const result = await prisma.dashboardState.upsert({
      where: { userId: session.user.id },
      update: upsertData,
      create: upsertData,
    });

    await logAuditAction({
      action: "DASHBOARD_SYNCED",
      resourceType: "dashboard",
      userId: session.user.id,
      metadata: { state: result },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("POST /api/dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to update dashboard state" },
      },
      { status: 500 },
    );
  }
}
