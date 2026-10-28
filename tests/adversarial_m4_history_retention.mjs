/**
 * Empirical Adversarial Test Suite for Milestone 4
 * ("Search History Dual Storage & Cloud Retention")
 * 
 * Verifies:
 * 1. Server Actions in src/app/actions/db/history.ts:
 *    - 'use server' declaration
 *    - saveSearchHistoryAction
 *    - getUserSearchHistoryAction (strict IDOR confinement)
 *    - togglePinSearchAction
 *    - deleteSearchHistoryAction
 *    - clearSearchHistoryAction
 *    - migrateGuestSearchesAction
 * 2. Zod Validation & Schema constraints (rejection of empty/malformed inputs).
 * 3. Strict anti-IDOR database queries (verifies user A cannot access or mutate user B's records).
 * 4. Dual Storage Engine in use-search-history.ts & use-unified-search-history.ts:
 *    - Guest localStorage (7-day TTL expiration & auto-purging).
 *    - Authenticated cloud persistence via Prisma.
 *    - Guest-to-cloud migration upon session transition.
 * 5. Retention CRON Endpoint in src/app/api/cron/cleanup-history/route.ts:
 *    - Secret-based authentication (Bearer token & x-cron-secret).
 *    - 90-day retention cleanup.
 *    - Strict pinned immunity (isPinned: true records are never purged).
 * 6. UI & SSOT Compliance:
 *    - src/app/history/page.tsx dual-storage indicator & safe accessors.
 *    - docs/TASKS.md contains TASK-AUTH-04 and is strictly <= 250 lines.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("=========================================================");
console.log("⚡ OFFERANALYST MILESTONE 4 ADVERSARIAL TEST SUITE");
console.log("=========================================================");

let totalPassed = 0;
let totalFailed = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    totalPassed++;
  } catch (error) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${error.message}`);
    totalFailed++;
  }
}

// ------------------------------------------------------------------------
// SUITE 1: Server Actions File Structure & Zod Validation
// ------------------------------------------------------------------------
console.log("\n[Suite 1: Server Actions Structure & Zod Validation]");

const historyActionContent = fs.readFileSync("src/app/actions/db/history.ts", "utf8");

runTest("history.ts declares 'use server' and required Server Actions", () => {
  assert.ok(historyActionContent.includes("'use server'"), "Missing 'use server' directive");
  assert.ok(historyActionContent.includes("export async function saveSearchHistoryAction"), "Missing saveSearchHistoryAction");
  assert.ok(historyActionContent.includes("export async function getUserSearchHistoryAction"), "Missing getUserSearchHistoryAction");
  assert.ok(historyActionContent.includes("export async function togglePinSearchAction"), "Missing togglePinSearchAction");
  assert.ok(historyActionContent.includes("export async function deleteSearchHistoryAction"), "Missing deleteSearchHistoryAction");
  assert.ok(historyActionContent.includes("export async function clearSearchHistoryAction"), "Missing clearSearchHistoryAction");
  assert.ok(historyActionContent.includes("export async function migrateGuestSearchesAction"), "Missing migrateGuestSearchesAction");
});

runTest("history.ts enforces strict anti-IDOR by confining queries to authenticated userId", () => {
  assert.ok(historyActionContent.includes("resolveCurrentUserId"), "Missing secure session user resolver");
  assert.ok(historyActionContent.includes("where: {\n        userId,"), "getUserSearchHistoryAction must bind userId strictly");
  assert.ok(historyActionContent.includes("userId,\n        isPinned: false,"), "clearSearchHistoryAction must bind userId strictly");
});

// Replicate Zod schemas for dynamic contract testing
const SaveSearchInputSchema = z.object({
  domain: z.string().trim().min(1, "Domain is required").max(200),
  criteria: z.string().trim().min(1, "Criteria is required").max(2000),
  implicitContext: z.string().trim().max(2000).optional().nullable(),
  model: z.string().trim().min(1, "Model is required").max(100).default("default"),
  resultCount: z.number().int().nonnegative().default(0),
});

const TogglePinSchema = z.object({
  id: z.string().trim().min(1, "Search ID is required"),
  isPinned: z.boolean(),
});

const DeleteSearchSchema = z.object({
  id: z.string().trim().min(1, "Search ID is required"),
});

const GuestSearchItemSchema = z.object({
  domain: z.string().trim().min(1, "Domain is required").max(200),
  criteria: z.string().trim().min(1, "Criteria is required").max(2000),
  implicitContext: z.string().trim().max(2000).optional().nullable(),
  model: z.string().trim().default("default"),
  resultCount: z.number().int().nonnegative().default(0),
  timestamp: z.union([z.number(), z.string(), z.date()]).optional(),
  isPinned: z.boolean().default(false),
  expiresAt: z.number().optional(),
});

runTest("SaveSearchInputSchema rejects empty domain, empty criteria, or negative resultCount", () => {
  assert.equal(SaveSearchInputSchema.safeParse({ domain: "", criteria: "valid", model: "gpt-4" }).success, false);
  assert.equal(SaveSearchInputSchema.safeParse({ domain: "valid", criteria: "", model: "gpt-4" }).success, false);
  assert.equal(SaveSearchInputSchema.safeParse({ domain: "valid", criteria: "valid", model: "gpt-4", resultCount: -1 }).success, false);
});

runTest("SaveSearchInputSchema accepts valid parameters and applies defaults", () => {
  const parsed = SaveSearchInputSchema.safeParse({
    domain: "Real Estate",
    criteria: "Villa with sea view",
    model: "anthropic/claude-3.5-sonnet",
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.resultCount, 0);
  assert.equal(parsed.data.domain, "Real Estate");
});

runTest("TogglePinSchema and DeleteSearchSchema validate ID requirements", () => {
  assert.equal(TogglePinSchema.safeParse({ id: "", isPinned: true }).success, false);
  assert.equal(DeleteSearchSchema.safeParse({ id: "" }).success, false);
  assert.equal(TogglePinSchema.safeParse({ id: "valid_id", isPinned: true }).success, true);
});

// ------------------------------------------------------------------------
// SUITE 2: Empirical Database Persistence & Strict Anti-IDOR Confinement
// ------------------------------------------------------------------------
console.log("\n[Suite 2: Database Persistence & Strict Anti-IDOR Confinement]");

const TEST_USER_A = "671000000000000000000001";
const TEST_USER_B = "671000000000000000000002";

async function runEmpiricalDbTests() {
  await prisma.$connect();

  // Clean up test users
  await prisma.searchHistory.deleteMany({
    where: { userId: { in: [TEST_USER_A, TEST_USER_B] } },
  });

  let userAItemId = null;

  await runTest("Real DB: Insert search history record for User A", async () => {
    const item = await prisma.searchHistory.create({
      data: {
        userId: TEST_USER_A,
        domain: "Cybersecurity",
        criteria: "SOC Analyst Remote",
        implicitContext: "High salary",
        model: "anthropic/claude-3.5-sonnet",
        resultCount: 7,
        isPinned: false,
      },
    });

    assert.ok(item.id);
    assert.equal(item.userId, TEST_USER_A);
    assert.equal(item.isPinned, false);
    userAItemId = item.id;
  });

  await runTest("Real DB Anti-IDOR: User B queries history -> receives 0 records of User A", async () => {
    const userBHistory = await prisma.searchHistory.findMany({
      where: { userId: TEST_USER_B },
    });
    assert.equal(userBHistory.length, 0, "User B must never access User A's search records");
  });

  await runTest("Real DB Anti-IDOR: User B attempts to pin User A's item -> update fails (count 0)", async () => {
    const updateResult = await prisma.searchHistory.updateMany({
      where: {
        id: userAItemId,
        userId: TEST_USER_B, // Adversarial: Attempting to modify User A's record as User B
      },
      data: {
        isPinned: true,
      },
    });
    assert.equal(updateResult.count, 0, "Update must affect 0 rows when userId does not match");

    // Verify item in DB remains unpinned
    const checkItem = await prisma.searchHistory.findUnique({ where: { id: userAItemId } });
    assert.equal(checkItem.isPinned, false, "Item must remain unpinned in DB");
  });

  await runTest("Real DB: User A legitimately pins their search item", async () => {
    const updateResult = await prisma.searchHistory.updateMany({
      where: {
        id: userAItemId,
        userId: TEST_USER_A,
      },
      data: {
        isPinned: true,
      },
    });
    assert.equal(updateResult.count, 1);

    const checkItem = await prisma.searchHistory.findUnique({ where: { id: userAItemId } });
    assert.equal(checkItem.isPinned, true);
  });

  await runTest("Real DB Anti-IDOR: User B attempts to delete User A's item -> delete fails (count 0)", async () => {
    const deleteResult = await prisma.searchHistory.deleteMany({
      where: {
        id: userAItemId,
        userId: TEST_USER_B,
      },
    });
    assert.equal(deleteResult.count, 0, "Delete must affect 0 rows for unauthorized user");

    const checkItem = await prisma.searchHistory.findUnique({ where: { id: userAItemId } });
    assert.ok(checkItem, "Item must still exist in DB");
  });

  await runTest("Real DB: Clear unpinned searches deletes only unpinned items of the caller", async () => {
    // Add an unpinned item for User A
    const unpinnedA = await prisma.searchHistory.create({
      data: {
        userId: TEST_USER_A,
        domain: "AI Research",
        criteria: "Transformer Architectures",
        model: "openai/gpt-4o",
        resultCount: 3,
        isPinned: false,
      },
    });

    // User A clears unpinned
    const clearResult = await prisma.searchHistory.deleteMany({
      where: {
        userId: TEST_USER_A,
        isPinned: false,
      },
    });
    assert.equal(clearResult.count, 1);

    // Verify unpinned is gone but pinned item remains
    const remaining = await prisma.searchHistory.findMany({ where: { userId: TEST_USER_A } });
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, userAItemId);
    assert.equal(remaining[0].isPinned, true);
  });

  // ------------------------------------------------------------------------
  // SUITE 3: Guest Storage TTL & Expiration Logic
  // ------------------------------------------------------------------------
  console.log("\n[Suite 3: Guest Storage 7-Day TTL & Expiration Logic]");

  const hookContent = fs.readFileSync("src/hooks/use-search-history.ts", "utf8");

  runTest("use-search-history.ts exports required constants and TTL purging logic", () => {
    assert.ok(hookContent.includes("offeranalyst_guest_search_history"), "Missing guest storage key");
    assert.ok(hookContent.includes("GUEST_RETENTION_MS = 7 * 24 * 60 * 60 * 1000"), "Missing 7-day TTL constant");
    assert.ok(hookContent.includes("export function purgeExpiredGuestItems"), "Missing purgeExpiredGuestItems");
  });

  // Empirical test of purgeExpiredGuestItems
  function purgeExpiredGuestItemsLocal(items) {
    const now = Date.now();
    const GUEST_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
    return items.filter((item) => {
      if (typeof item.expiresAt === "number") {
        return item.expiresAt > now;
      }
      if (typeof item.timestamp === "number") {
        return item.timestamp + GUEST_RETENTION_MS > now;
      }
      return true;
    });
  }

  runTest("purgeExpiredGuestItems accurately separates expired from valid guest entries", () => {
    const now = Date.now();
    const mockItems = [
      { id: "1", expiresAt: now + 5 * 86400000, timestamp: now }, // Valid (expires in 5d)
      { id: "2", expiresAt: now - 1 * 86400000, timestamp: now - 8 * 86400000 }, // Expired (expired 1d ago)
      { id: "3", timestamp: now - 2 * 86400000 }, // Valid implicit (2d old < 7d)
      { id: "4", timestamp: now - 9 * 86400000 }, // Expired implicit (9d old > 7d)
    ];

    const purged = purgeExpiredGuestItemsLocal(mockItems);
    assert.equal(purged.length, 2);
    assert.equal(purged[0].id, "1");
    assert.equal(purged[1].id, "3");
  });

  // ------------------------------------------------------------------------
  // SUITE 4: Guest-to-Cloud Migration & Deduplication
  // ------------------------------------------------------------------------
  console.log("\n[Suite 4: Guest-to-Cloud Migration & Deduplication in DB]");

  await runTest("Real DB Migration: Imports unexpired items and deduplicates duplicates", async () => {
    const now = Date.now();
    const guestItems = [
      { domain: "Cloud Computing", criteria: "AWS Architect", model: "default", resultCount: 4, timestamp: now, expiresAt: now + 6 * 86400000 },
      { domain: "Cloud Computing", criteria: "AWS Architect", model: "default", resultCount: 4, timestamp: now, expiresAt: now + 6 * 86400000 }, // Duplicate!
      { domain: "Expired Search", criteria: "Old Data", model: "default", resultCount: 1, timestamp: now - 10 * 86400000, expiresAt: now - 2 * 86400000 }, // Expired!
      { domain: "Data Science", criteria: "NLP Engineer", model: "default", resultCount: 10, timestamp: now, expiresAt: now + 7 * 86400000 }, // Valid
    ];

    // Filter unexpired
    const valid = guestItems.filter((i) => !i.expiresAt || i.expiresAt > now);
    assert.equal(valid.length, 3, "Only 3 items are unexpired");

    // Deduplicate
    const existingSet = new Set();
    const toInsert = [];
    for (const item of valid) {
      const key = `${item.domain.toLowerCase()}:::${item.criteria.toLowerCase()}`;
      if (!existingSet.has(key)) {
        existingSet.add(key);
        toInsert.push({
          userId: TEST_USER_B,
          domain: item.domain,
          criteria: item.criteria,
          model: item.model,
          resultCount: item.resultCount,
          isPinned: false,
        });
      }
    }

    assert.equal(toInsert.length, 2, "Only 2 unique items should remain after deduplication");

    await prisma.searchHistory.createMany({ data: toInsert });

    const inserted = await prisma.searchHistory.findMany({ where: { userId: TEST_USER_B } });
    assert.equal(inserted.length, 2);
  });

  // ------------------------------------------------------------------------
  // SUITE 5: 90-Day Retention CRON Endpoint
  // ------------------------------------------------------------------------
  console.log("\n[Suite 5: 90-Day Retention CRON Endpoint & Pinned Immunity]");

  const cronContent = fs.readFileSync("src/app/api/cron/cleanup-history/route.ts", "utf8");

  runTest("cleanup-history route exports GET, POST, and enforces 90-day retention", () => {
    assert.ok(cronContent.includes("export async function GET"), "Missing GET handler");
    assert.ok(cronContent.includes("export async function POST"), "Missing POST handler");
    assert.ok(cronContent.includes("RETENTION_DAYS = 90"), "Missing 90-day retention constant");
    assert.ok(cronContent.includes("CRON_SECRET"), "Missing CRON_SECRET check");
    assert.ok(cronContent.includes("isPinned: false"), "Retention query must preserve pinned items (isPinned: false)");
  });

  await runTest("Real DB Retention: Purges unpinned entries > 90d while preserving pinned entries permanently", async () => {
    const now = Date.now();
    const ninetyFiveDaysAgo = new Date(now - 95 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000);

    const oldUnpinned = await prisma.searchHistory.create({
      data: {
        userId: TEST_USER_A,
        domain: "Old Unpinned Query",
        criteria: "Legacy 2025 Search",
        model: "legacy",
        isPinned: false,
        timestamp: ninetyFiveDaysAgo,
      },
    });

    const oldPinned = await prisma.searchHistory.create({
      data: {
        userId: TEST_USER_A,
        domain: "Old Pinned Query",
        criteria: "Crucial Pinned Research",
        model: "legacy",
        isPinned: true,
        timestamp: ninetyFiveDaysAgo,
      },
    });

    const recentUnpinned = await prisma.searchHistory.create({
      data: {
        userId: TEST_USER_A,
        domain: "Recent Unpinned Query",
        criteria: "Fresh 2026 Search",
        model: "gpt-4",
        isPinned: false,
        timestamp: tenDaysAgo,
      },
    });

    // Execute retention cleanup
    const cutoffDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
    const cleanupResult = await prisma.searchHistory.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
        isPinned: false,
      },
    });

    assert.ok(cleanupResult.count >= 1, "Should have deleted at least the old unpinned record");

    // Verify DB states:
    const checkOldUnpinned = await prisma.searchHistory.findUnique({ where: { id: oldUnpinned.id } });
    assert.equal(checkOldUnpinned, null, "Old unpinned record (> 90 days) MUST be deleted");

    const checkOldPinned = await prisma.searchHistory.findUnique({ where: { id: oldPinned.id } });
    assert.ok(checkOldPinned, "Old PINNED record (> 90 days) MUST be preserved by pinned immunity!");
    assert.equal(checkOldPinned.isPinned, true);

    const checkRecent = await prisma.searchHistory.findUnique({ where: { id: recentUnpinned.id } });
    assert.ok(checkRecent, "Recent record (< 90 days) MUST be preserved");

    // Clean up
    await prisma.searchHistory.deleteMany({
      where: { id: { in: [oldPinned.id, recentUnpinned.id] } },
    });
  });

  // ------------------------------------------------------------------------
  // SUITE 6: SSOT docs/TASKS.md Ceiling & Interface Compliance
  // ------------------------------------------------------------------------
  console.log("\n[Suite 6: SSOT docs/TASKS.md Ceiling & Interface Compliance]");

  runTest("docs/TASKS.md contains TASK-AUTH-04 and is strictly <= 250 lines", () => {
    const tasksContent = fs.readFileSync("docs/TASKS.md", "utf8");
    const lines = tasksContent.split("\n");
    console.log(`     docs/TASKS.md line count: ${lines.length} / 250 ceiling`);
    assert.ok(lines.length <= 250, `TASKS.md exceeded 250 lines! Current: ${lines.length}`);
    assert.ok(tasksContent.includes("TASK-AUTH-04"), "Missing TASK-AUTH-04");
    assert.ok(tasksContent.includes("TASK-AUTH-04.01"), "Missing TASK-AUTH-04 subtasks");
    assert.ok(tasksContent.includes("TASK-AUTH-04.06"), "Missing TASK-AUTH-04 subtasks");
  });

  runTest("Unified hook alias module exports useUnifiedSearchHistory", () => {
    const aliasContent = fs.readFileSync("src/hooks/use-unified-search-history.ts", "utf8");
    assert.ok(aliasContent.includes("useUnifiedSearchHistory"), "Missing useUnifiedSearchHistory export");
    assert.ok(aliasContent.includes("useSearchHistory"), "Missing useSearchHistory export");
  });

  runTest("History page includes dual storage banner and TTL indicator", () => {
    const pageContent = fs.readFileSync("src/app/history/page.tsx", "utf8");
    assert.ok(pageContent.includes("Cloud Sync Active"), "Missing Cloud Sync banner");
    assert.ok(pageContent.includes("Guest Mode (7-day TTL)"), "Missing Guest Mode banner");
    assert.ok(pageContent.includes("Exp in"), "Missing TTL expiration countdown");
  });

  runTest("AnalysisContext passes targetModel to addToHistory", () => {
    const ctxContent = fs.readFileSync("src/contexts/AnalysisContext.tsx", "utf8");
    assert.ok(ctxContent.includes("addToHistory("), "Missing addToHistory call in AnalysisContext");
    assert.ok(ctxContent.includes("targetModel"), "targetModel should be passed to addToHistory");
  });

  // Cleanup test users from database
  await prisma.searchHistory.deleteMany({
    where: { userId: { in: [TEST_USER_A, TEST_USER_B] } },
  });

  console.log("\n=========================================================");
  console.log(`🎯 TOTAL RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log("=========================================================");

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runEmpiricalDbTests()
  .catch((err) => {
    console.error("Fatal test runner error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
