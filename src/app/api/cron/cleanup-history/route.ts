import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQStashReceiver } from '@/lib/qstash';

export const dynamic = 'force-dynamic';

const RETENTION_DAYS = 90;

/**
 * Verify whether incoming request is authorized via CRON_SECRET or Upstash QStash signature.
 */
async function isAuthorized(request: NextRequest, rawBody?: string): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  const cronSecretHeader = request.headers.get('x-cron-secret');
  const configuredSecret = process.env.CRON_SECRET;

  // 1. Direct Secret Check (Bearer token or custom header)
  if (configuredSecret) {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token === configuredSecret) {
        return true;
      }
    }
    if (cronSecretHeader && cronSecretHeader.trim() === configuredSecret) {
      return true;
    }
  }

  // 2. QStash Signature Verification (if called via scheduled Upstash job)
  const upstashSignature = request.headers.get('upstash-signature');
  if (upstashSignature) {
    const receiver = getQStashReceiver();
    if (receiver) {
      try {
        const bodyToVerify = rawBody ?? (await request.clone().text());
        const isValid = await receiver.verify({
          signature: upstashSignature,
          body: bodyToVerify,
        });
        if (isValid) {
          return true;
        }
      } catch (err) {
        console.error('[cron/cleanup-history] QStash signature error:', err);
      }
    }
  }

  // 3. Permissive dev fallback ONLY when no secret is configured and not in production
  if (!configuredSecret && process.env.NODE_ENV !== 'production') {
    return true;
  }

  return false;
}

/**
 * Core handler to purge unpinned search history older than 90 days
 */
async function handleCleanup(request: NextRequest, rawBody?: string) {
  const authorized = await isAuthorized(request, rawBody);
  if (!authorized) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized: Invalid or missing authorization token or QStash signature.',
      },
      { status: 401 }
    );
  }

  try {
    const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

    // Retention policy: Delete unpinned entries older than 90 days.
    // Pinned searches (isPinned: true) are preserved indefinitely.
    const deleted = await prisma.searchHistory.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
        isPinned: false,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
      count: deleted.count,
      retentionDays: RETENTION_DAYS,
      cutoffDate: cutoffDate.toISOString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[cron/cleanup-history] Retention cleanup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database error during retention cleanup.',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleCleanup(request);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  return handleCleanup(request, rawBody);
}
