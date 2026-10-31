/**
 * Export API Route: PDF & CSV Generation & Download
 * 
 * Secure endpoint with rate limiting, Zod validation, and security headers.
 * Supports:
 * - POST: Direct analysis payload export (PDF / CSV)
 * - GET: Export from shared token or analysis ID (?token=...&format=pdf|csv)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCsv, generatePdfReport } from '@/lib/export';
import {
  rateLimit,
  rateLimitConfigs,
  getClientIdentifier,
  createRateLimitHeaders,
} from '@/lib/rate-limiter';
import { getSecurityHeaders } from '@/lib/security-headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { AnalysisResponse, ScoredOffer } from '@/types';

// Zod Schema for POST payload
const ExportPayloadSchema = z.object({
  format: z.enum(['pdf', 'csv']).default('csv'),
  domain: z.string().max(200).optional(),
  criteria: z.string().max(2000).optional(),
  model: z.string().max(100).optional(),
  language: z.enum(['fr', 'en']).optional().default('fr'),
  analysis: z.object({
    topOffers: z.array(
      z.object({
        id: z.string().optional(),
        title: z.string(),
        price: z.union([z.string(), z.number()]).optional(),
        location: z.string().optional(),
        category: z.string().optional(),
        finalScore: z.number().optional(),
        rank: z.number().optional(),
        justification: z.string().optional(),
        webInsights: z.array(z.string()).optional(),
        url: z.string().optional(),
        breakdown: z
          .object({
            relevance: z.number().optional(),
            quality: z.number().optional(),
            trend: z.number().optional(),
          })
          .optional(),
      })
    ),
    marketSummary: z.string().default(''),
    searchSources: z
      .array(
        z.object({
          title: z.string().optional(),
          uri: z.string(),
        })
      )
      .optional(),
    totalAnalyzed: z.number().optional(),
    modelUsed: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);
    const rateLimitResult = rateLimit(identifier, rateLimitConfigs.api);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            ...createRateLimitHeaders(rateLimitResult),
            ...getSecurityHeaders(),
          },
        }
      );
    }

    const body = await request.json();
    const parseResult = ExportPayloadSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid export payload', details: parseResult.error.flatten() },
        {
          status: 400,
          headers: {
            ...createRateLimitHeaders(rateLimitResult),
            ...getSecurityHeaders(),
          },
        }
      );
    }

    const { format, domain, criteria, model, language, analysis } = parseResult.data;
    const safeDomain = (domain || 'analysis').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();

    if (format === 'csv') {
      const csvContent = generateCsv(analysis as unknown as AnalysisResponse, {
        domain,
        criteria,
        model,
        language,
        date: new Date(),
      });

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="offeranalyst-${safeDomain}-${timestamp}.csv"`,
          ...createRateLimitHeaders(rateLimitResult),
          ...getSecurityHeaders(),
        },
      });
    }

    // PDF format
    const pdfBytes = generatePdfReport(analysis as unknown as AnalysisResponse, {
      domain,
      criteria,
      model,
      language,
      date: new Date(),
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="offeranalyst-${safeDomain}-${timestamp}.pdf"`,
        ...createRateLimitHeaders(rateLimitResult),
        ...getSecurityHeaders(),
      },
    });
  } catch (error) {
    console.error('[API /api/export POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while generating export' },
      {
        status: 500,
        headers: getSecurityHeaders(),
      }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);
    const rateLimitResult = rateLimit(identifier, rateLimitConfigs.api);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            ...createRateLimitHeaders(rateLimitResult),
            ...getSecurityHeaders(),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || searchParams.get('id');
    const format = (searchParams.get('format') || 'pdf').toLowerCase();
    const language = (searchParams.get('lang') || 'fr') === 'en' ? 'en' : 'fr';

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token or id query parameter' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Fetch from shared analyses safely
    let currentUserId: string | null = null;
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      currentUserId = session?.user?.id || null;
    } catch {
      currentUserId = null;
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(token);
    const shared = await prisma.sharedAnalysis.findFirst({
      where: isObjectId
        ? {
            OR: [
              { shareToken: token },
              ...(currentUserId ? [{ id: token, userId: currentUserId }] : []),
            ],
          }
        : {
            shareToken: token,
          },
    });

    if (!shared) {
      return NextResponse.json(
        { error: 'Shared analysis not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    if (shared.expiresAt && shared.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Shared analysis has expired' },
        { status: 410, headers: getSecurityHeaders() }
      );
    }

    let topOffers: ScoredOffer[] = [];
    try {
      topOffers = JSON.parse(shared.topOffers);
    } catch {
      topOffers = [];
    }

    let searchSources = undefined;
    if (shared.searchSources) {
      try {
        searchSources = JSON.parse(shared.searchSources);
      } catch {
        searchSources = undefined;
      }
    }

    const analysis: AnalysisResponse = {
      topOffers,
      marketSummary: shared.marketSummary,
      searchSources,
      totalAnalyzed: shared.totalAnalyzed,
      modelUsed: shared.model || undefined,
    };

    const safeDomain = (shared.domain || 'analysis').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();

    if (format === 'csv') {
      const csvContent = generateCsv(analysis, {
        domain: shared.domain,
        criteria: shared.criteria || undefined,
        model: shared.model || undefined,
        language,
        date: shared.createdAt,
      });

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="offeranalyst-${safeDomain}-${timestamp}.csv"`,
          ...createRateLimitHeaders(rateLimitResult),
          ...getSecurityHeaders(),
        },
      });
    }

    const pdfBytes = generatePdfReport(analysis, {
      domain: shared.domain,
      criteria: shared.criteria || undefined,
      model: shared.model || undefined,
      language,
      date: shared.createdAt,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="offeranalyst-${safeDomain}-${timestamp}.pdf"`,
        ...createRateLimitHeaders(rateLimitResult),
        ...getSecurityHeaders(),
      },
    });
  } catch (error) {
    console.error('[API /api/export GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while retrieving export' },
      {
        status: 500,
        headers: getSecurityHeaders(),
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      ...getSecurityHeaders(),
    },
  });
}
