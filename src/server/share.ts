'use server';

/**
 * Server Actions: Shared Analysis & Public Collaboration Links
 * 
 * Conforms to Agent.md & PROJECT.md Architecture:
 * - Server-side Better-Auth session resolution (optional association)
 * - Strict input validation with Zod schemas
 * - Standardized return contract: { success: true, data } | { success: false, error }
 * - Cryptographically random URL-safe tokens with expiration & view counter
 * - Read-only public consultation without mutation rights
 */

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import crypto from 'crypto';
import { ScoredOffer, SearchSource } from '@/types';

// ============================================================================
// ZOD SCHEMAS & TYPES
// ============================================================================

const CreateShareInputSchema = z.object({
  domain: z.string().trim().min(1, 'Domain is required').max(200),
  criteria: z.string().trim().max(2000).optional().nullable(),
  model: z.string().trim().max(100).optional().nullable(),
  analysis: z.object({
    topOffers: z.array(z.any()),
    marketSummary: z.string().default(''),
    searchSources: z.array(z.any()).optional(),
    totalAnalyzed: z.number().optional(),
    modelUsed: z.string().optional(),
  }),
  ttlDays: z.number().int().min(1).max(365).optional().default(30),
});
export type CreateShareInput = z.infer<typeof CreateShareInputSchema>;

export interface SharedAnalysisOutput {
  id: string;
  shareToken: string;
  domain: string;
  criteria?: string | null;
  model?: string | null;
  marketSummary: string;
  topOffers: ScoredOffer[];
  searchSources?: SearchSource[];
  totalAnalyzed: number;
  views: number;
  createdAt: string;
  expiresAt?: string | null;
  isOwner: boolean;
}

export type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// HELPERS
// ============================================================================

async function resolveCurrentUserId(): Promise<string | null> {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch {
    // Outside Next.js request context or guest user
  }
  return null;
}

function generateSecureToken(): string {
  // 18 bytes random = 24 chars base64url, prefix with sh_
  return 'sh_' + crypto.randomBytes(18).toString('base64url');
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Creates a public share link for an analysis.
 * Works seamlessly for both authenticated users and guest users.
 */
export async function createShareLinkAction(
  rawInput: CreateShareInput
): Promise<ActionResponse<{ shareUrl: string; shareToken: string; expiresAt?: string }>> {
  try {
    const parseResult = CreateShareInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || 'Invalid input data',
      };
    }

    const { domain, criteria, model, analysis, ttlDays } = parseResult.data;
    const userId = await resolveCurrentUserId();

    const shareToken = generateSecureToken();
    const expiresAt = ttlDays ? new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000) : null;

    const record = await prisma.sharedAnalysis.create({
      data: {
        shareToken,
        domain,
        criteria: criteria || null,
        model: model || analysis.modelUsed || null,
        marketSummary: analysis.marketSummary || '',
        topOffers: JSON.stringify(analysis.topOffers || []),
        searchSources: analysis.searchSources ? JSON.stringify(analysis.searchSources) : null,
        totalAnalyzed: analysis.totalAnalyzed || analysis.topOffers.length,
        views: 0,
        expiresAt,
        userId: userId || null,
      },
      select: {
        id: true,
        shareToken: true,
        expiresAt: true,
      },
    });

    return {
      success: true,
      data: {
        shareUrl: `/share/${record.shareToken}`,
        shareToken: record.shareToken,
        expiresAt: record.expiresAt ? record.expiresAt.toISOString() : undefined,
      },
    };
  } catch (error) {
    console.error('[createShareLinkAction] Error:', error);
    return {
      success: false,
      error: 'Failed to generate share link. Please try again.',
    };
  }
}

/**
 * Retrieves a shared analysis for public read-only viewing.
 * Increments view counter and checks expiration.
 */
export async function getSharedAnalysisAction(
  tokenOrId: string,
  options?: { incrementView?: boolean }
): Promise<ActionResponse<SharedAnalysisOutput>> {
  try {
    if (!tokenOrId || typeof tokenOrId !== 'string' || tokenOrId.trim().length === 0) {
      return { success: false, error: 'Token is required' };
    }

    const sanitizedToken = tokenOrId.trim();
    const currentUserId = await resolveCurrentUserId();
    const shouldIncrement = options?.incrementView !== false;

    // Secure query: Only match shareToken for public consultation.
    // If querying by internal MongoDB ObjectId, require that current user is the owner (userId)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(sanitizedToken);
    const record = await prisma.sharedAnalysis.findFirst({
      where: isObjectId
        ? {
            OR: [
              { shareToken: sanitizedToken },
              ...(currentUserId ? [{ id: sanitizedToken, userId: currentUserId }] : []),
            ],
          }
        : {
            shareToken: sanitizedToken,
          },
    });

    if (!record) {
      return {
        success: false,
        error: 'Share link not found or invalid',
      };
    }

    // Check expiration
    if (record.expiresAt && record.expiresAt < new Date()) {
      return {
        success: false,
        error: 'This shared analysis link has expired',
      };
    }

    // Increment view count if requested
    if (shouldIncrement) {
      try {
        await prisma.sharedAnalysis.update({
          where: { id: record.id },
          data: { views: { increment: 1 } },
        });
      } catch (err) {
        console.warn('[getSharedAnalysisAction] Failed to increment views:', err);
      }
    }

    let topOffers: ScoredOffer[] = [];
    try {
      topOffers = JSON.parse(record.topOffers);
    } catch {
      topOffers = [];
    }

    let searchSources: SearchSource[] | undefined = undefined;
    if (record.searchSources) {
      try {
        searchSources = JSON.parse(record.searchSources);
      } catch {
        searchSources = undefined;
      }
    }

    const isOwner = Boolean(currentUserId && record.userId && currentUserId === record.userId);

    return {
      success: true,
      data: {
        id: record.id,
        shareToken: record.shareToken,
        domain: record.domain,
        criteria: record.criteria,
        model: record.model,
        marketSummary: record.marketSummary,
        topOffers,
        searchSources,
        totalAnalyzed: record.totalAnalyzed,
        views: record.views + (shouldIncrement ? 1 : 0),
        createdAt: record.createdAt.toISOString(),
        expiresAt: record.expiresAt ? record.expiresAt.toISOString() : null,
        isOwner,
      },
    };
  } catch (error) {
    console.error('[getSharedAnalysisAction] Error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while loading the shared analysis',
    };
  }
}
