'use server';

/**
 * Search History Database Server Actions
 * 
 * Conforms to Agent.md & PROJECT.md Interface Contracts:
 * - Server-side Better-Auth session verification (Strict anti-IDOR)
 * - Strict input validation with Zod schemas
 * - Standardized return contract: { success: true, data } | { success: false, error }
 * - Automatic revalidation of /history route
 * - Dual-storage support: Guest migration & cloud persistence
 */

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { SearchHistory } from '@prisma/client';

// ============================================================================
// ZOD SCHEMAS & TYPES
// ============================================================================

export const SaveSearchInputSchema = z.object({
  domain: z.string().trim().min(1, 'Domain is required').max(200),
  criteria: z.string().trim().min(1, 'Criteria is required').max(2000),
  implicitContext: z.string().trim().max(2000).optional().nullable(),
  model: z.string().trim().min(1, 'Model is required').max(100).default('default'),
  resultCount: z.number().int().nonnegative().default(0),
});
export type SaveSearchInput = z.infer<typeof SaveSearchInputSchema>;

export const GetHistoryOptionsSchema = z.object({
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(50).optional(),
  pinnedOnly: z.boolean().default(false).optional(),
}).optional();
export type GetHistoryOptions = z.infer<typeof GetHistoryOptionsSchema>;

export const TogglePinSchema = z.object({
  id: z.string().trim().min(1, 'Search ID is required'),
  isPinned: z.boolean(),
});

export const DeleteSearchSchema = z.object({
  id: z.string().trim().min(1, 'Search ID is required'),
});

export const GuestSearchItemSchema = z.object({
  id: z.string().optional(),
  domain: z.string().trim().min(1, 'Domain is required').max(200),
  criteria: z.string().trim().min(1, 'Criteria is required').max(2000),
  implicitContext: z.string().trim().max(2000).optional().nullable(),
  model: z.string().trim().default('default'),
  resultCount: z.number().int().nonnegative().default(0),
  timestamp: z.union([z.number(), z.string(), z.date()]).optional(),
  isPinned: z.boolean().default(false),
  expiresAt: z.number().optional(),
});
export type GuestSearchItem = z.infer<typeof GuestSearchItemSchema>;

export const MigrateGuestSearchesSchema = z.array(GuestSearchItemSchema).max(100);

export type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// HELPER: SECURE SESSION RESOLUTION (STRICT ANTI-IDOR)
// ============================================================================

async function resolveCurrentUserId(explicitUserIdForTest?: string): Promise<string | null> {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch {
    // Outside Next.js request scope (e.g. testing context)
  }

  // Strictly controlled test fallback: ONLY permitted during explicit test executions
  if (process.env.NODE_ENV === 'test' && explicitUserIdForTest) {
    return explicitUserIdForTest;
  }

  return null;
}

function safeRevalidateHistory() {
  try {
    revalidatePath('/history');
  } catch {
    // Silently ignore when called outside Next.js request context
  }
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * 1. Save a new search history record for the authenticated user
 */
export async function saveSearchHistoryAction(
  entry: SaveSearchInput,
  _testUserId?: string
): Promise<{ success: true; data: SearchHistory } | { success: false; error: string }> {
  try {
    const userId = await resolveCurrentUserId(_testUserId);
    if (!userId) {
      return { success: false, error: 'Unauthorized: User session required to save history.' };
    }

    const parsed = SaveSearchInputSchema.safeParse(entry);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid search history input.',
      };
    }

    const { domain, criteria, implicitContext, model, resultCount } = parsed.data;

    const created = await prisma.searchHistory.create({
      data: {
        userId,
        domain,
        criteria,
        implicitContext: implicitContext || null,
        model,
        resultCount,
        isPinned: false,
      },
    });

    safeRevalidateHistory();
    return { success: true, data: created };
  } catch (error) {
    console.error('[saveSearchHistoryAction] Error saving search history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database error while saving search history.',
    };
  }
}

/**
 * 2. Get paginated search history for the authenticated user (Strict Anti-IDOR)
 */
export async function getUserSearchHistoryAction(
  options?: GetHistoryOptions,
  _testUserId?: string
): Promise<{ success: true; data: SearchHistory[]; total: number } | { success: false; error: string }> {
  try {
    const userId = await resolveCurrentUserId(_testUserId);
    if (!userId) {
      return { success: false, error: 'Unauthorized: User session required to fetch history.' };
    }

    const parsedOptions = GetHistoryOptionsSchema.safeParse(options);
    const validOptions = parsedOptions.success ? parsedOptions.data : {};
    const page = validOptions?.page ?? 1;
    const limit = validOptions?.limit ?? 50;
    const pinnedOnly = validOptions?.pinnedOnly ?? false;

    // Strict IDOR enforcement: userId ALWAYS locked to authenticated user
    const where = {
      userId,
      ...(pinnedOnly ? { isPinned: true } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.searchHistory.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { timestamp: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.searchHistory.count({ where }),
    ]);

    return { success: true, data: items, total };
  } catch (error) {
    console.error('[getUserSearchHistoryAction] Error fetching search history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database error while fetching search history.',
    };
  }
}

/**
 * 3. Toggle pin status of a search history entry (Strict Anti-IDOR)
 */
export async function togglePinSearchAction(
  id: string,
  isPinned: boolean,
  _testUserId?: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const userId = await resolveCurrentUserId(_testUserId);
    if (!userId) {
      return { success: false, error: 'Unauthorized: User session required.' };
    }

    const parsed = TogglePinSchema.safeParse({ id, isPinned });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid parameters.' };
    }

    // Strict Anti-IDOR: update only matching id AND userId
    const updateResult = await prisma.searchHistory.updateMany({
      where: {
        id: parsed.data.id,
        userId,
      },
      data: {
        isPinned: parsed.data.isPinned,
      },
    });

    if (updateResult.count === 0) {
      return { success: false, error: 'Search record not found or unauthorized.' };
    }

    safeRevalidateHistory();
    return { success: true };
  } catch (error) {
    console.error('[togglePinSearchAction] Error toggling pin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database error while updating pin status.',
    };
  }
}

/**
 * 4. Delete a search history entry (Strict Anti-IDOR)
 */
export async function deleteSearchHistoryAction(
  id: string,
  _testUserId?: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const userId = await resolveCurrentUserId(_testUserId);
    if (!userId) {
      return { success: false, error: 'Unauthorized: User session required.' };
    }

    const parsed = DeleteSearchSchema.safeParse({ id });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid search ID.' };
    }

    // Strict Anti-IDOR: delete only matching id AND userId
    const deleteResult = await prisma.searchHistory.deleteMany({
      where: {
        id: parsed.data.id,
        userId,
      },
    });

    if (deleteResult.count === 0) {
      return { success: false, error: 'Search record not found or unauthorized.' };
    }

    safeRevalidateHistory();
    return { success: true };
  } catch (error) {
    console.error('[deleteSearchHistoryAction] Error deleting search:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database error while deleting search record.',
    };
  }
}

/**
 * 5. Clear unpinned search history entries for the authenticated user
 */
export async function clearSearchHistoryAction(
  _testUserId?: string
): Promise<{ success: true; count: number } | { success: false; error: string }> {
  try {
    const userId = await resolveCurrentUserId(_testUserId);
    if (!userId) {
      return { success: false, error: 'Unauthorized: User session required.' };
    }

    // Only delete unpinned searches for this specific user
    const deleteResult = await prisma.searchHistory.deleteMany({
      where: {
        userId,
        isPinned: false,
      },
    });

    safeRevalidateHistory();
    return { success: true, count: deleteResult.count };
  } catch (error) {
    console.error('[clearSearchHistoryAction] Error clearing unpinned history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database error while clearing search history.',
    };
  }
}

/**
 * 6. Migrate unexpired guest search entries to MongoDB Atlas on login/signup
 */
export async function migrateGuestSearchesAction(
  guestItems: GuestSearchItem[],
  _testUserId?: string
): Promise<{ success: true; count: number } | { success: false; error: string }> {
  try {
    const userId = await resolveCurrentUserId(_testUserId);
    if (!userId) {
      return { success: false, error: 'Unauthorized: User session required for migration.' };
    }

    const parsed = MigrateGuestSearchesSchema.safeParse(guestItems);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid guest items format.' };
    }

    const now = Date.now();
    // Filter out expired items (TTL check: expiresAt must be in the future if present)
    const validItems = parsed.data.filter(
      (item) => !item.expiresAt || item.expiresAt > now
    );

    if (validItems.length === 0) {
      return { success: true, count: 0 };
    }

    // Deduplicate against existing search history for this user
    const existing = await prisma.searchHistory.findMany({
      where: { userId },
      select: { domain: true, criteria: true },
      take: 200,
    });

    const existingSet = new Set(
      existing.map((e) => `${e.domain.toLowerCase()}:::${e.criteria.toLowerCase()}`)
    );

    const itemsToInsert = [];
    for (const item of validItems) {
      const key = `${item.domain.toLowerCase()}:::${item.criteria.toLowerCase()}`;
      if (!existingSet.has(key)) {
        existingSet.add(key); // Deduplicate within batch as well
        itemsToInsert.push({
          userId,
          domain: item.domain,
          criteria: item.criteria,
          implicitContext: item.implicitContext || null,
          model: item.model || 'default',
          resultCount: item.resultCount || 0,
          isPinned: item.isPinned || false,
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
        });
      }
    }

    if (itemsToInsert.length === 0) {
      return { success: true, count: 0 };
    }

    // Bulk insert into MongoDB
    await prisma.searchHistory.createMany({
      data: itemsToInsert,
    });

    safeRevalidateHistory();
    return { success: true, count: itemsToInsert.length };
  } catch (error) {
    console.error('[migrateGuestSearchesAction] Error migrating guest searches:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database error while migrating guest searches.',
    };
  }
}
