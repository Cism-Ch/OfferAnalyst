import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { log } from "@/lib/logger";
import { Resend } from "resend";

const RequestResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ConfirmResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIdentifier(request);

    // Rate limit: 5 requests per 15 minutes per IP
    const rateLimitResult = rateLimit(`reset-pass:${clientIp}`, {
      max: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Mode B: Confirm reset with token & newPassword
    if (body.token && body.newPassword) {
      const validation = ConfirmResetSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.issues[0]?.message || "Invalid payload" },
          { status: 400 }
        );
      }

      const { token, newPassword } = validation.data;

      // Find token
      const record = await prisma.verificationToken.findUnique({
        where: { token },
      });

      if (!record) {
        return NextResponse.json(
          { error: "Invalid or expired reset token" },
          { status: 400 }
        );
      }

      if (new Date() > record.expires) {
        await prisma.verificationToken.delete({
          where: { id: record.id },
        }).catch(() => null);

        return NextResponse.json(
          { error: "Reset token has expired. Please request a new link." },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password
      await prisma.user.update({
        where: { email: record.identifier },
        data: { password: hashedPassword },
      });

      // Invalidate token
      await prisma.verificationToken.delete({
        where: { id: record.id },
      });

      log.info("User password successfully reset", {
        email: record.identifier,
      });

      return NextResponse.json({
        success: true,
        message: "Your password has been reset successfully. You can now log in.",
      });
    }

    // Mode A: Request reset link with email
    const requestValidation = RequestResetSchema.safeParse(body);
    if (!requestValidation.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const { email } = requestValidation.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always respond with success to prevent user email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a reset link has been sent.",
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    // Upsert verification token
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
      create: {
        identifier: email,
        token,
        expires,
      },
      update: {
        expires,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/auth/reset?token=${token}&email=${encodeURIComponent(email)}`;

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "OfferAnalyst <notifications@offeranalyst.com>",
          to: email,
          subject: "Reset your OfferAnalyst password",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #4f46e5;">Password Reset Request</h2>
              <p>You requested to reset your password for OfferAnalyst. Click the button below to choose a new password:</p>
              <div style="margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        log.error("Failed to send password reset email via Resend", emailErr);
      }
    } else {
      log.info(`[Development Password Reset Link] URL for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error) {
    log.error("Error in reset-password endpoint", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
