import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectSchema } from "@/lib/db/schemas";
import { logAuditAction } from "@/lib/db/audit";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isValidObjectId } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects
 *
 * Fetches all projects for the authenticated user.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ success: true, data: [] });
      // Alternatively return 401, but frontend might expect empty array for guests.
      // But since this is a private route, typically 401 or empty.
      // Let's stick to empty to avoid breaking UI if it just renders list.
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("[API Projects GET] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch projects", code: "FETCH_ERROR" },
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/projects
 *
 * Saves or updates a project for the authenticated user.
 */
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

    // Validate inputs
    ProjectSchema.parse(body);

    const { id, name, description, searchIds } = body;

    // Validate ObjectId format if ID is provided
    const isUpdate = id && isValidObjectId(id);

    let existing = null;
    if (isUpdate) {
      existing = await prisma.project.findUnique({ where: { id } });
    }

    let operationResult;
    let action: "PROJECT_CREATED" | "PROJECT_UPDATED" = "PROJECT_UPDATED";

    if (existing) {
      if (existing.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: { message: "Forbidden" } },
          { status: 403 },
        );
      }
      operationResult = await prisma.project.update({
        where: { id },
        data: {
          name: name || existing.name,
          description: description || existing.description,
          searchIds: searchIds || existing.searchIds,
          updatedAt: new Date(),
        },
      });
    } else {
      action = "PROJECT_CREATED";
      operationResult = await prisma.project.create({
        data: {
          name: name || "Untitled Project",
          description: description || "",
          searchIds: searchIds || [],
          userId: session.user.id,
        },
      });
    }

    await logAuditAction({
      action: action,
      resourceId: operationResult.id,
      resourceType: "project",
      userId: session.user.id,
      metadata: { result: operationResult },
    });

    return NextResponse.json({ success: true, data: operationResult });
  } catch (error: unknown) {
    console.error("[API Projects POST] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to save project" },
      },
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
        { success: false, error: { message: "ID is required" } },
        { status: 400 },
      );
    }

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid Project ID format" } },
        { status: 400 },
      );
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: { message: "Project not found" } },
        { status: 404 },
      );
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden" } },
        { status: 403 },
      );
    }

    const result = await prisma.project.delete({
      where: { id },
    });

    await logAuditAction({
      action: "PROJECT_DELETED",
      resourceId: id,
      resourceType: "project",
      userId: session.user.id,
      metadata: { result },
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("[API Projects DELETE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to delete project" },
      },
      { status: 500 },
    );
  }
}
