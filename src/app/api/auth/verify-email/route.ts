import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { log } from "@/lib/logger";

const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = VerifyEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    // Look up token in database
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid verification link or token has already been used" },
        { status: 400 }
      );
    }

    // Check token expiration (24h default)
    if (new Date() > record.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { id: record.id },
      }).catch(() => null);

      return NextResponse.json(
        { error: "Verification link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find the user with this email identifier
    const user = await prisma.user.findUnique({
      where: { email: record.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Associated user account could not be found" },
        { status: 404 }
      );
    }

    // Mark user email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    // Invalidate the single-use token
    await prisma.verificationToken.delete({
      where: { id: record.id },
    });

    log.info("Email verified successfully", {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    log.error("Error during email verification", error);
    return NextResponse.json(
      { error: "Internal server error occurred while verifying email" },
      { status: 500 }
    );
  }
}
