import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { syncToTigrisSearch, deleteFromTigrisSearch } from "@/lib/db/tigris";
import { isValidObjectId } from "@/lib/utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/history
 * Protected: Fetch User's Search History
 */
export async function GET(request: Request) {
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
    const query = searchParams.get("q");

    let history;

    // If query present, use Tigris for search then fetch from DB
    // Indexing User History in Tigris allows full-text search on past queries
    if (query && process.env.ENABLE_TIGRIS_SEARCH === "true") {
      // TODO: Implement Tigris search scoped to userId if possible, or filter results in app
      // For now, we'll just search standard Prisma for simplicity and strict data segregation
      // unless Tigris supports tenant scoping easily in this setup.
      // Fallback to Prisma search for security first.
      history = await prisma.searchHistory.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { domain: { contains: query, mode: "insensitive" } },
            { criteria: { contains: query, mode: "insensitive" } },
            { context: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: [{ pinned: "desc" }, { timestamp: "desc" }],
      });
    } else {
      history = await prisma.searchHistory.findMany({
        where: { userId: session.user.id },
        orderBy: [{ pinned: "desc" }, { timestamp: "desc" }],
      });
    }

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("[API History GET] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch history" } },
      { status: 500 },
    );
  }
}

/**
 * POST /api/history
 * Save a search to history (Protected)
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If not authenticated, we simply don't save history (or client handles it locally)
    // But this API endpoint expects auth.
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const body = await request.json();
    // body should contain: id (optional generation), inputs (domain, criteria, context)

    const inputs = body.inputs || {};

    const result = await prisma.searchHistory.create({
      data: {
        domain: inputs.domain || "General",
        criteria: inputs.criteria,
        context: inputs.context,
        inputs: inputs, // Store full JSON
        results: body.results, // Optional light summary if needed
        timestamp: new Date(),
        userId: session.user.id,
      },
    });

    if (process.env.ENABLE_TIGRIS_SEARCH === "true") {
      await syncToTigrisSearch("history", {
        id: result.id,
        domain: result.domain,
        criteria: result.criteria,
        context: result.context,
        timestamp: result.timestamp.getTime(),
        userId: session.user.id,
      });
    }

    return NextResponse.json({ success: true, data: { id: result.id } });
  } catch (error) {
    console.error("[API History POST] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to save history" } },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/history
 * Update history item (e.g. Pinning)
 */
export async function PATCH(request: Request) {
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
    const { id, pinned } = body;

    if (!id)
      return NextResponse.json(
        { success: false, error: { message: "ID required" } },
        { status: 400 },
      );

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid ID format" } },
        { status: 400 },
      );
    }

    // Update with strict userId filter
    const updated = await prisma.searchHistory.updateMany({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: {
        pinned: !!pinned,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { success: false, error: { message: "Not found or unauthorized" } },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: { id, pinned } });
  } catch (error) {
    console.error("[API History PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Update failed" } },
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
    const clearAll = searchParams.get("clear") === "true";

    if (clearAll) {
      const deleted = await prisma.searchHistory.deleteMany({
        where: { userId: session.user.id },
      });
      // Optional: Log clear action
      return NextResponse.json({
        success: true,
        data: { cleared: true, count: deleted.count },
      });
    }

    if (!id)
      return NextResponse.json(
        { success: false, error: { message: "ID required" } },
        { status: 400 },
      );

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid ID format" } },
        { status: 400 },
      );
    }

    const deleted = await prisma.searchHistory.deleteMany({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, error: { message: "Not found or unauthorized" } },
        { status: 404 },
      );
    }

    if (process.env.ENABLE_TIGRIS_SEARCH === "true") {
      await deleteFromTigrisSearch("history", id);
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("[API History DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Delete failed" } },
      { status: 500 },
    );
  }
}
