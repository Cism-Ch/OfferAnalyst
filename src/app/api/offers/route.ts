import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OfferSchema } from "@/types";
import { syncToTigrisSearch, deleteFromTigrisSearch } from "@/lib/db/tigris";
import { logAuditAction } from "@/lib/db/audit";
import { ZodError } from "zod";
import { isValidObjectId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
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

    const userOffers = await prisma.offer.findMany({
      where: { userId: session.user.id },
      orderBy: { savedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: userOffers });
  } catch (error) {
    console.error("[API Offers GET] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch offers" } },
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

    // Zod Validation with clean error response
    let validatedOffer;
    try {
      validatedOffer = OfferSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: { message: "Invalid offer data", details: err.issues },
          },
          { status: 400 },
        );
      }
      throw err;
    }

    const result = await prisma.offer.create({
      data: {
        originalId: validatedOffer.id,
        title: validatedOffer.title,
        description: validatedOffer.description,
        price: validatedOffer.price?.toString(),
        location: validatedOffer.location,
        category: validatedOffer.category,
        link: validatedOffer.url,
        userId: session.user.id,
        savedAt: new Date(),
      },
    });

    if (process.env.ENABLE_TIGRIS_SEARCH === "true") {
      await syncToTigrisSearch("offers", {
        id: result.id,
        originalId: validatedOffer.id,
        title: validatedOffer.title,
        description: validatedOffer.description,
        category: validatedOffer.category,
        price: validatedOffer.price,
        location: validatedOffer.location,
        userId: session.user.id,
      });
    }

    await logAuditAction({
      action: "OFFER_SAVED",
      resourceId: result.id,
      resourceType: "offer",
      userId: session.user.id,
      metadata: { originalId: validatedOffer.id },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[API Offers POST] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to save offer" } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "ID required" } },
        { status: 400 },
      );
    }

    const deleted = await prisma.offer.deleteMany({
      where: {
        userId: session.user.id,
        OR: [...(isValidObjectId(id) ? [{ id }] : []), { originalId: id }],
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, error: { message: "Not found or unauthorized" } },
        { status: 404 },
      );
    }

    if (process.env.ENABLE_TIGRIS_SEARCH === "true") {
      await deleteFromTigrisSearch("offers", id);
    }

    await logAuditAction({
      action: "OFFER_REMOVED",
      resourceId: id,
      resourceType: "offer",
      userId: session.user.id,
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("[API Offers DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Delete failed" } },
      { status: 500 },
    );
  }
}
