import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { z } from "zod";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { log } from "@/lib/logger";
import { Resend } from "resend";

const ResendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIdentifier(request);

    // Rate limit: 3 requests per 15 minutes per IP
    const rateLimitResult = rateLimit(`resend-verify:${clientIp}`, {
      max: 3,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = ResendSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Valid email address required" },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If user does not exist or already verified, return generic message for security
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a verification link has been sent.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "This email address is already verified.",
        alreadyVerified: true,
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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
    const verificationUrl = `${appUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

    // Dispatch email via Resend if API key is provided
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "OfferAnalyst <notifications@offeranalyst.com>",
          to: email,
          subject: "Verify your OfferAnalyst email address",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #4f46e5;">Verify your Email Address</h2>
              <p>Welcome to OfferAnalyst! Click the button below to confirm your email address and activate your account:</p>
              <div style="margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Verify Email
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        log.error("Failed to send verification email via Resend", emailErr);
      }
    } else {
      log.info(`[Development Email Link] Verification URL for ${email}: ${verificationUrl}`);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a verification link has been sent.",
    });
  } catch (error) {
    log.error("Error in resend-verification endpoint", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
