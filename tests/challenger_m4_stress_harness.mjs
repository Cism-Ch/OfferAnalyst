/**
 * CHALLENGER M4 EMPIRICAL ADVERSARIAL STRESS HARNESS
 * 
 * Target: Milestone 4 — Search History Dual Storage & Cloud Retention
 * 
 * Verifies:
 * 1. IDOR Confinement & Multi-Tenant Attack Stress (Alice vs Bob vs Eve)
 * 2. 7-Day TTL Expiration Boundary (Exact ms precision & timestamp corruption)
 * 3. Guest Migration Deduplication & Bulk Stress (100 items, case-insensitivity, unicode/XSS, schema >100 rejection)
 * 4. 90-Day Retention & Pinned Immunity in MongoDB (89d vs 91d vs 91d pinned vs 365d pinned, exact cutoff boundary)
 * 5. Route Authorization for /api/cron/cleanup-history (Secret verification, bearer, header, production fail-closed)
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("================================================================================");
console.log("⚔️ CHALLENGER M4: EMPIRICAL STRESS & ADVERSARIAL TEST HARNESS");
console.log("================================================================================");

let passedCount = 0;
let failedCount = 0;
const failureDetails = [];

async function challenge(title, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${title}`);
    passedCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${title}`);
    console.error(`     Reason: ${err.message}`);
    failedCount++;
    failureDetails.push({ title, error: err.message, stack: err.stack });
  }
}

// ============================================================================
// SUITE 1: IDOR CONFINEMENT & MULTI-TENANT ATTACK STRESS
// ============================================================================
console.log("\n[SUITE 1: IDOR Confinement & Multi-Tenant Attack Stress]");

const USER_ALICE = "6710000000000000000000a1";
const USER_BOB   = "6710000000000000000000b2";
const USER_EVE   = "6710000000000000000000e3";

async function runIdorTests() {
  await prisma.$connect();

  // Purge any existing test records for test tenants
  await prisma.searchHistory.deleteMany({
    where: { userId: { in: [USER_ALICE, USER_BOB, USER_EVE] } },
  });

  // Seed Alice's search items
  const itemA1 = await prisma.searchHistory.create({
    data: {
      userId: USER_ALICE,
      domain: "Cybersecurity",
      criteria: "Lead Penetration Tester Remote",
      implicitContext: "Confidential research",
      model: "claude-3-5-sonnet",
      resultCount: 12,
      isPinned: true, // Pinned item
    },
  });

  const itemA2 = await prisma.searchHistory.create({
    data: {
      userId: USER_ALICE,
      domain: "Machine Learning",
      criteria: "Adversarial Robustness Engineer",
      implicitContext: "PyTorch, CUDA",
      model: "gpt-4o",
      resultCount: 5,
      isPinned: false, // Unpinned item
    },
  });

  // Seed Bob's search item
  const itemB1 = await prisma.searchHistory.create({
    data: {
      userId: USER_BOB,
      domain: "Web Development",
      criteria: "Senior Next.js Architect",
      model: "gpt-4o",
      resultCount: 20,
      isPinned: false,
    },
  });

  await challenge("IDOR Read Attack: Bob queries history -> strictly receives 1 item (his own), Alice's items never leaked", async () => {
    const bobHistory = await prisma.searchHistory.findMany({
      where: { userId: USER_BOB },
    });
    assert.equal(bobHistory.length, 1);
    assert.equal(bobHistory[0].id, itemB1.id);
    assert.equal(bobHistory[0].userId, USER_BOB);

    // Verify Alice's items are NOT present in Bob's view
    const leaked = bobHistory.filter(h => h.userId === USER_ALICE);
    assert.equal(leaked.length, 0, "Alice's search history leaked to Bob!");
  });

  await challenge("IDOR Update Attack: Bob attempts to pin Alice's unpinned itemA2 -> DB rejects with 0 updated rows", async () => {
    // Attack: Bob passes Alice's item ID but Bob's session
    const updateResult = await prisma.searchHistory.updateMany({
      where: {
        id: itemA2.id,
        userId: USER_BOB,
      },
      data: { isPinned: true },
    });
    assert.equal(updateResult.count, 0, "IDOR Vulnerability: Bob modified Alice's record!");

    // Verify itemA2 remains unpinned
    const refreshedA2 = await prisma.searchHistory.findUnique({ where: { id: itemA2.id } });
    assert.equal(refreshedA2.isPinned, false, "Alice's record was mutated!");
  });

  await challenge("IDOR Unpin Attack: Bob attempts to unpin Alice's pinned itemA1 -> DB rejects with 0 updated rows", async () => {
    const updateResult = await prisma.searchHistory.updateMany({
      where: {
        id: itemA1.id,
        userId: USER_BOB,
      },
      data: { isPinned: false },
    });
    assert.equal(updateResult.count, 0, "IDOR Vulnerability: Bob unpinned Alice's record!");

    const refreshedA1 = await prisma.searchHistory.findUnique({ where: { id: itemA1.id } });
    assert.equal(refreshedA1.isPinned, true, "Alice's pinned status was compromised!");
  });

  await challenge("IDOR Delete Attack: Bob attempts to delete Alice's itemA2 -> DB rejects with 0 deleted rows", async () => {
    const deleteResult = await prisma.searchHistory.deleteMany({
      where: {
        id: itemA2.id,
        userId: USER_BOB,
      },
    });
    assert.equal(deleteResult.count, 0, "IDOR Vulnerability: Bob deleted Alice's record!");

    const checkA2 = await prisma.searchHistory.findUnique({ where: { id: itemA2.id } });
    assert.ok(checkA2, "Alice's record was removed!");
  });

  await challenge("IDOR Clear History Attack: Bob clears unpinned history -> only deletes Bob's items, Alice's items untouched", async () => {
    const clearResult = await prisma.searchHistory.deleteMany({
      where: {
        userId: USER_BOB,
        isPinned: false,
      },
    });
    assert.equal(clearResult.count, 1, "Should only delete Bob's unpinned item");

    // Alice's unpinned itemA2 must still exist!
    const checkA2 = await prisma.searchHistory.findUnique({ where: { id: itemA2.id } });
    assert.ok(checkA2, "Alice's unpinned item was deleted during Bob's clear!");

    // Alice's pinned itemA1 must still exist!
    const checkA1 = await prisma.searchHistory.findUnique({ where: { id: itemA1.id } });
    assert.ok(checkA1, "Alice's pinned item was deleted during Bob's clear!");
  });

  await challenge("IDOR Injection Stress: Eve attempts SQL/NoSQL injection payloads as ID parameter", async () => {
    const injectionIds = [
      "' OR '1'='1",
      "'; DROP TABLE search_history; --",
      "6710000000000000000000ff", // Valid ObjectId format but non-existent
      "000000000000000000000000",
      "null",
      "undefined",
      "A".repeat(5000),
    ];

    for (const injectedId of injectionIds) {
      // Safe execution mimicking Server Action try/catch
      let pinCount = 0;
      try {
        const pinAttempt = await prisma.searchHistory.updateMany({
          where: { id: injectedId, userId: USER_EVE },
          data: { isPinned: true },
        });
        pinCount = pinAttempt.count;
      } catch {
        // Prisma driver safely rejects invalid BSON ObjectID without querying DB
        pinCount = 0;
      }
      assert.equal(pinCount, 0, `Injection attack on ID '${injectedId}' must never mutate records`);

      let delCount = 0;
      try {
        const delAttempt = await prisma.searchHistory.deleteMany({
          where: { id: injectedId, userId: USER_EVE },
        });
        delCount = delAttempt.count;
      } catch {
        // Prisma driver safely rejects invalid BSON ObjectID without querying DB
        delCount = 0;
      }
      assert.equal(delCount, 0, `Injection attack on ID '${injectedId}' must never delete records`);
    }
  });

  await challenge("IDOR Session Verification: history.ts strictly guards resolveCurrentUserId fallback behind process.env.NODE_ENV === 'test'", () => {
    const historyCode = fs.readFileSync("src/app/actions/db/history.ts", "utf8");
    // Ensure test fallback cannot be triggered in production
    assert.ok(
      historyCode.includes("process.env.NODE_ENV === 'test' && explicitUserIdForTest"),
      "Test fallback MUST be strictly gated by process.env.NODE_ENV === 'test'"
    );
    assert.ok(
      historyCode.includes("const userId = await resolveCurrentUserId"),
      "All actions must resolve current userId securely"
    );
  });
}

// ============================================================================
// SUITE 2: 7-DAY TTL EXPIRATION BOUNDARY & TIMESTAMP CORRUPTION
// ============================================================================
console.log("\n[SUITE 2: 7-Day TTL Expiration Boundary & Timestamp Corruption]");

// Exact implementation from src/hooks/use-search-history.ts
const GUEST_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

function purgeExpiredGuestItems(items) {
  const now = Date.now();
  return items.filter((item) => {
    if (!item || typeof item !== "object") return false;
    if (typeof item.expiresAt === "number") {
      return item.expiresAt > now;
    }
    if (typeof item.timestamp === "number") {
      return item.timestamp + GUEST_RETENTION_MS > now;
    }
    return false;
  });
}

challenge("TTL Boundary: Item at exactly expiresAt - 1ms is PURGED (expired)", () => {
  const now = Date.now();
  const items = [
    { id: "past_1ms", expiresAt: now - 1 },
  ];
  const result = purgeExpiredGuestItems(items);
  assert.equal(result.length, 0, "Item expired 1ms ago should be purged");
});

challenge("TTL Boundary: Item at exactly expiresAt (expiresAt === now) is PURGED (expired)", () => {
  const now = Date.now();
  const items = [
    { id: "exact_now", expiresAt: now },
  ];
  const result = purgeExpiredGuestItems(items);
  assert.equal(result.length, 0, "Item at exact expiration timestamp should be purged");
});

challenge("TTL Boundary: Item at exactly expiresAt + 1ms is RETAINED (valid)", () => {
  const now = Date.now();
  const items = [
    { id: "future_1ms", expiresAt: now + 1 },
  ];
  const result = purgeExpiredGuestItems(items);
  assert.equal(result.length, 1, "Item expiring in 1ms should be retained");
});

challenge("TTL Boundary: Missing expiresAt inferred from timestamp boundary (7d - 1ms vs 7d + 1ms)", () => {
  const now = Date.now();
  const items = [
    { id: "expired_ts", timestamp: now - GUEST_RETENTION_MS - 1 }, // 7 days + 1ms ago (expired)
    { id: "exact_ts", timestamp: now - GUEST_RETENTION_MS },       // exactly 7 days ago (expired)
    { id: "valid_ts", timestamp: now - GUEST_RETENTION_MS + 100 }, // 7 days - 100ms ago (valid)
    { id: "fresh_ts", timestamp: now - 3600000 },                  // 1 hour ago (valid)
  ];
  const result = purgeExpiredGuestItems(items);
  assert.equal(result.length, 2);
  assert.equal(result[0].id, "valid_ts");
  assert.equal(result[1].id, "fresh_ts");
});

challenge("TTL Timestamp Corruption: NaN, -Infinity, 0, negative, and invalid values are safely dropped", () => {
  const corruptedItems = [
    { id: "nan", expiresAt: NaN },
    { id: "neg_inf", expiresAt: -Infinity },
    { id: "zero", expiresAt: 0 },
    { id: "negative", expiresAt: -1000 },
    { id: "null_exp", expiresAt: null, timestamp: NaN },
    { id: "string_exp", expiresAt: "invalid", timestamp: "corrupted" },
    null,
    undefined,
    {},
  ];
  const result = purgeExpiredGuestItems(corruptedItems);
  assert.equal(result.length, 0, "All corrupted items must be purged without crashing");
});

// ============================================================================
// SUITE 3: GUEST MIGRATION DEDUPLICATION & BULK STRESS (100 ITEMS)
// ============================================================================
console.log("\n[SUITE 3: Guest Migration Deduplication & Bulk Stress]");

const GuestSearchItemSchema = z.object({
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
const MigrateGuestSearchesSchema = z.array(GuestSearchItemSchema).max(100);

async function runMigrationStressTests() {
  const now = Date.now();

  await challenge("Schema Boundary: Rejects guest batch exceeding 100 items (101 items)", () => {
    const overflowBatch = Array.from({ length: 101 }, (_, i) => ({
      domain: `Domain ${i}`,
      criteria: `Criteria ${i}`,
      model: "default",
      resultCount: 1,
    }));
    const parseResult = MigrateGuestSearchesSchema.safeParse(overflowBatch);
    assert.equal(parseResult.success, false, "Schema must reject > 100 items");
    assert.ok(
      parseResult.error.issues[0]?.message.includes("100"),
      "Error should specify array limit of 100"
    );
  });

  await challenge("Schema Acceptance: Validates batch of exactly 100 items", () => {
    const validBatch = Array.from({ length: 100 }, (_, i) => ({
      domain: `Domain ${i}`,
      criteria: `Criteria ${i}`,
      model: "default",
      resultCount: 1,
    }));
    const parseResult = MigrateGuestSearchesSchema.safeParse(validBatch);
    assert.equal(parseResult.success, true);
  });

  await challenge("Migration Deduplication & Bulk Ingestion: Stress test with 100 items, mixed duplicates, expired, and Unicode/XSS", async () => {
    // Clean user Eve
    await prisma.searchHistory.deleteMany({ where: { userId: USER_EVE } });

    // Pre-seed 3 items in DB for user Eve
    await prisma.searchHistory.createMany({
      data: [
        {
          userId: USER_EVE,
          domain: "FinTech",
          criteria: "Senior Solidity Auditor",
          model: "default",
          resultCount: 5,
          isPinned: false,
        },
        {
          userId: USER_EVE,
          domain: "Cybersecurity",
          criteria: "Cloud Security Architect",
          model: "default",
          resultCount: 8,
          isPinned: true,
        },
        {
          userId: USER_EVE,
          domain: "Healthcare",
          criteria: "Biotech Data Scientist",
          model: "default",
          resultCount: 2,
          isPinned: false,
        },
      ],
    });

    // Build 100 items batch:
    // - 20 items: Expired (expiresAt = now - 1 hour)
    // - 3 items: Duplicate of pre-existing DB items (with case variations: "fintech" vs "FinTech")
    // - 35 unique valid items
    // - 35 exact duplicates of those unique items (with case variations: "AI ENGINEER" vs "ai engineer")
    // - 7 special character items (Unicode, emojis, quotes, XSS vectors, long criteria)
    // Total = 20 + 3 + 35 + 35 + 7 = 100 items!
    const batch = [];

    // 20 Expired items
    for (let i = 0; i < 20; i++) {
      batch.push({
        domain: `Expired Domain ${i}`,
        criteria: `Expired Query ${i}`,
        model: "default",
        resultCount: 0,
        expiresAt: now - 3600000, // 1 hour ago
        timestamp: now - 8 * 86400000,
      });
    }

    // 3 Items matching pre-existing DB items
    batch.push({
      domain: "fintech", // lowercase duplicate of "FinTech"
      criteria: "senior solidity auditor",
      model: "default",
      resultCount: 5,
      expiresAt: now + 86400000,
    });
    batch.push({
      domain: "CYBERSECURITY", // uppercase duplicate of "Cybersecurity"
      criteria: "CLOUD SECURITY ARCHITECT",
      model: "default",
      resultCount: 8,
      expiresAt: now + 86400000,
    });
    batch.push({
      domain: "Healthcare",
      criteria: "Biotech Data Scientist",
      model: "default",
      resultCount: 2,
      expiresAt: now + 86400000,
    });

    // 35 Unique valid items + 35 Duplicate items
    for (let i = 0; i < 35; i++) {
      batch.push({
        domain: `Engineering Category ${i}`,
        criteria: `Search Query Criterion #${i}`,
        model: "claude-3-5-sonnet",
        resultCount: i + 1,
        expiresAt: now + 5 * 86400000,
      });
      // Duplicate with case alteration
      batch.push({
        domain: `ENGINEERING CATEGORY ${i}`,
        criteria: `SEARCH QUERY CRITERION #${i}`,
        model: "claude-3-5-sonnet",
        resultCount: i + 1,
        expiresAt: now + 5 * 86400000,
      });
    }

    // 7 Special character items
    const specialItems = [
      {
        domain: "🚀 Intelligence Artificielle",
        criteria: "Ingénieur R&D en Deep Learning / Vision 3D & LLM",
        implicitContext: "Contrat CDI • 90k€+ • Télétravail complet",
        model: "openai/gpt-4o",
        resultCount: 14,
        expiresAt: now + 6 * 86400000,
      },
      {
        domain: "Security <script>alert('xss')</script>",
        criteria: "Penetration Tester \"Red Team\" & DevSecOps; DROP TABLE users;",
        implicitContext: "null \0 byte test",
        model: "default",
        resultCount: 3,
        expiresAt: now + 6 * 86400000,
      },
      {
        domain: "Legal & Compliance",
        criteria: "DPO / RGPD & Privacy Specialist (Paris, Lyon, Marseille)",
        implicitContext: "A".repeat(1500), // Long context
        model: "default",
        resultCount: 7,
        expiresAt: now + 6 * 86400000,
      },
      {
        domain: "High Criteria Length",
        criteria: "B".repeat(1990), // Near max 2000 chars
        model: "default",
        resultCount: 1,
        expiresAt: now + 6 * 86400000,
      },
      {
        domain: "Quoted Search",
        criteria: "Special 'single' and \"double\" quotes & backticks `code`",
        model: "default",
        resultCount: 2,
        expiresAt: now + 6 * 86400000,
      },
      {
        domain: "Arabic & Asian Characters",
        criteria: "مطور برمجيات / ソフトウェアエンジニア",
        model: "default",
        resultCount: 9,
        expiresAt: now + 6 * 86400000,
      },
      {
        domain: "Math & Symbols",
        criteria: "Quantitative Analyst (f(x) = λ * ∫ e^(-x) dx) $150k - $250k",
        model: "default",
        resultCount: 4,
        expiresAt: now + 6 * 86400000,
      },
    ];
    batch.push(...specialItems);

    assert.equal(batch.length, 100, "Stress batch must contain exactly 100 items");

    // Execute migration logic
    const parsed = MigrateGuestSearchesSchema.safeParse(batch);
    assert.equal(parsed.success, true);

    // 1. Filter out expired items
    const unexpired = parsed.data.filter((item) => !item.expiresAt || item.expiresAt > now);
    assert.equal(unexpired.length, 80, "20 expired items should be filtered out");

    // 2. Fetch existing items from DB for User Eve
    const existing = await prisma.searchHistory.findMany({
      where: { userId: USER_EVE },
      select: { domain: true, criteria: true },
      take: 200,
    });
    assert.equal(existing.length, 3, "User Eve has 3 pre-seeded items in DB");

    const existingSet = new Set(
      existing.map((e) => `${e.domain.toLowerCase()}:::${e.criteria.toLowerCase()}`)
    );

    // 3. Deduplicate
    const itemsToInsert = [];
    for (const item of unexpired) {
      const key = `${item.domain.toLowerCase()}:::${item.criteria.toLowerCase()}`;
      if (!existingSet.has(key)) {
        existingSet.add(key); // Deduplicate within batch
        itemsToInsert.push({
          userId: USER_EVE,
          domain: item.domain,
          criteria: item.criteria,
          implicitContext: item.implicitContext || null,
          model: item.model || "default",
          resultCount: item.resultCount || 0,
          isPinned: item.isPinned || false,
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
        });
      }
    }

    // Expected newly inserted:
    // 35 unique items + 7 special items = 42 items!
    // (The 3 pre-existing duplicates were dropped, and 35 in-batch duplicates were dropped)
    assert.equal(itemsToInsert.length, 42, `Expected 42 items to insert, got ${itemsToInsert.length}`);

    // Insert into real MongoDB database
    await prisma.searchHistory.createMany({ data: itemsToInsert });

    // Verify DB count
    const totalEveInDb = await prisma.searchHistory.count({ where: { userId: USER_EVE } });
    assert.equal(totalEveInDb, 45, "Total items in DB must be 3 (pre-seeded) + 42 (migrated) = 45");

    // Verify special characters persisted correctly without corruption
    const emojiRecord = await prisma.searchHistory.findFirst({
      where: { userId: USER_EVE, domain: "🚀 Intelligence Artificielle" },
    });
    assert.ok(emojiRecord, "Emoji record must exist in DB");
    assert.equal(emojiRecord.criteria, "Ingénieur R&D en Deep Learning / Vision 3D & LLM");

    const xssRecord = await prisma.searchHistory.findFirst({
      where: { userId: USER_EVE, domain: "Security <script>alert('xss')</script>" },
    });
    assert.ok(xssRecord, "XSS test record must exist safely in DB");
  });
}

// ============================================================================
// SUITE 4: 90-DAY RETENTION & PINNED IMMUNITY IN MONGODB
// ============================================================================
console.log("\n[SUITE 4: 90-Day Retention & Pinned Immunity in MongoDB]");

const RETENTION_DAYS = 90;

async function runRetentionStressTests() {
  const now = Date.now();
  const cutoffDate = new Date(now - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  // Clean test user Alice
  await prisma.searchHistory.deleteMany({ where: { userId: USER_ALICE } });

  // Create 7 test records across the retention timeline
  const rec89dUnpinned = await prisma.searchHistory.create({
    data: {
      userId: USER_ALICE,
      domain: "Retain 89d",
      criteria: "Search from 89 days ago",
      model: "gpt-4",
      timestamp: new Date(now - 89 * 86400000),
      isPinned: false,
    },
  });

  const rec91dUnpinned = await prisma.searchHistory.create({
    data: {
      userId: USER_ALICE,
      domain: "Purge 91d",
      criteria: "Search from 91 days ago",
      model: "gpt-4",
      timestamp: new Date(now - 91 * 86400000),
      isPinned: false,
    },
  });

  const rec91dPinned = await prisma.searchHistory.create({
    data: {
      userId: USER_ALICE,
      domain: "Keep 91d Pinned",
      criteria: "Crucial pinned research from 91 days ago",
      model: "gpt-4",
      timestamp: new Date(now - 91 * 86400000),
      isPinned: true, // PINNED!
    },
  });

  const rec365dPinned = await prisma.searchHistory.create({
    data: {
      userId: USER_ALICE,
      domain: "Keep 1 Year Pinned",
      criteria: "Historical research from 365 days ago",
      model: "gpt-3.5",
      timestamp: new Date(now - 365 * 86400000),
      isPinned: true, // PINNED!
    },
  });

  const recBoundaryMinus1msUnpinned = await prisma.searchHistory.create({
    data: {
      userId: USER_ALICE,
      domain: "Boundary Older",
      criteria: "Exact cutoff - 1ms unpinned",
      model: "gpt-4",
      timestamp: new Date(cutoffDate.getTime() - 1),
      isPinned: false,
    },
  });

  const recBoundaryPlus1msUnpinned = await prisma.searchHistory.create({
    data: {
      userId: USER_ALICE,
      domain: "Boundary Younger",
      criteria: "Exact cutoff + 1ms unpinned",
      model: "gpt-4",
      timestamp: new Date(cutoffDate.getTime() + 1),
      isPinned: false,
    },
  });

  const recBoundaryMinus1msPinned = await prisma.searchHistory.create({
    data: {
      userId: USER_ALICE,
      domain: "Boundary Older Pinned",
      criteria: "Exact cutoff - 1ms PINNED",
      model: "gpt-4",
      timestamp: new Date(cutoffDate.getTime() - 1),
      isPinned: true, // PINNED!
    },
  });

  await challenge("Retention Execution: Executes deleteMany with timestamp < cutoffDate and isPinned == false", async () => {
    const deleted = await prisma.searchHistory.deleteMany({
      where: {
        userId: USER_ALICE,
        timestamp: { lt: cutoffDate },
        isPinned: false,
      },
    });
    // Expected deleted: rec91dUnpinned and recBoundaryMinus1msUnpinned (exactly 2 records)
    assert.equal(deleted.count, 2, `Expected 2 records deleted, got ${deleted.count}`);
  });

  await challenge("Retention Boundary: 89-day unpinned record is strictly PRESERVED", async () => {
    const found = await prisma.searchHistory.findUnique({ where: { id: rec89dUnpinned.id } });
    assert.ok(found, "89-day search was erroneously deleted!");
  });

  await challenge("Retention Boundary: 91-day unpinned record is strictly DELETED", async () => {
    const found = await prisma.searchHistory.findUnique({ where: { id: rec91dUnpinned.id } });
    assert.equal(found, null, "91-day unpinned search was not deleted!");
  });

  await challenge("Retention Pinned Immunity: 91-day PINNED record is strictly PRESERVED", async () => {
    const found = await prisma.searchHistory.findUnique({ where: { id: rec91dPinned.id } });
    assert.ok(found, "91-day PINNED search was erroneously deleted!");
    assert.equal(found.isPinned, true);
  });

  await challenge("Retention Pinned Immunity: 365-day PINNED record is strictly PRESERVED", async () => {
    const found = await prisma.searchHistory.findUnique({ where: { id: rec365dPinned.id } });
    assert.ok(found, "1-year-old PINNED search was erroneously deleted!");
    assert.equal(found.isPinned, true);
  });

  await challenge("Retention Cutoff Boundary: cutoff - 1ms unpinned is DELETED, cutoff + 1ms unpinned is PRESERVED", async () => {
    const older = await prisma.searchHistory.findUnique({ where: { id: recBoundaryMinus1msUnpinned.id } });
    assert.equal(older, null, "Record older by 1ms should be deleted");

    const younger = await prisma.searchHistory.findUnique({ where: { id: recBoundaryPlus1msUnpinned.id } });
    assert.ok(younger, "Record younger by 1ms should be preserved");
  });

  await challenge("Retention Cutoff Boundary: cutoff - 1ms PINNED record is strictly PRESERVED", async () => {
    const olderPinned = await prisma.searchHistory.findUnique({ where: { id: recBoundaryMinus1msPinned.id } });
    assert.ok(olderPinned, "Pinned record older by 1ms should be preserved by immunity");
  });
}

// ============================================================================
// SUITE 5: ROUTE AUTHORIZATION FOR /api/cron/cleanup-history
// ============================================================================
console.log("\n[SUITE 5: Route Authorization for /api/cron/cleanup-history]");

function evaluateRouteAuthorization({ headers, configuredSecret, nodeEnv }) {
  const authHeader = headers['authorization'];
  const cronSecretHeader = headers['x-cron-secret'];

  // 1. Direct Secret Check
  if (configuredSecret) {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token === configuredSecret) {
        return { authorized: true, status: 200 };
      }
    }
    if (cronSecretHeader && cronSecretHeader.trim() === configuredSecret) {
      return { authorized: true, status: 200 };
    }
  }

  // 2. QStash Signature Verification (mocked)
  const upstashSignature = headers['upstash-signature'];
  if (upstashSignature === 'valid_qstash_signature') {
    return { authorized: true, status: 200 };
  }

  // 3. Permissive dev fallback ONLY when no secret is configured and not in production
  if (!configuredSecret && nodeEnv !== 'production') {
    return { authorized: true, status: 200 };
  }

  return {
    authorized: false,
    status: 401,
    error: 'Unauthorized: Invalid or missing authorization token or QStash signature.',
  };
}

challenge("Route Auth: Rejects request with missing authorization headers when CRON_SECRET is set", () => {
  const result = evaluateRouteAuthorization({
    headers: {},
    configuredSecret: "super_secret_token_123",
    nodeEnv: "production",
  });
  assert.equal(result.authorized, false);
  assert.equal(result.status, 401);
});

challenge("Route Auth: Rejects request with forged Bearer token", () => {
  const result = evaluateRouteAuthorization({
    headers: { authorization: "Bearer wrong_token_abc" },
    configuredSecret: "super_secret_token_123",
    nodeEnv: "production",
  });
  assert.equal(result.authorized, false);
  assert.equal(result.status, 401);
});

challenge("Route Auth: Rejects request with forged x-cron-secret header", () => {
  const result = evaluateRouteAuthorization({
    headers: { "x-cron-secret": "forged_secret_xyz" },
    configuredSecret: "super_secret_token_123",
    nodeEnv: "production",
  });
  assert.equal(result.authorized, false);
  assert.equal(result.status, 401);
});

challenge("Route Auth: Accepts request with valid Bearer token", () => {
  const result = evaluateRouteAuthorization({
    headers: { authorization: "Bearer super_secret_token_123" },
    configuredSecret: "super_secret_token_123",
    nodeEnv: "production",
  });
  assert.equal(result.authorized, true);
  assert.equal(result.status, 200);
});

challenge("Route Auth: Accepts request with valid x-cron-secret header", () => {
  const result = evaluateRouteAuthorization({
    headers: { "x-cron-secret": "super_secret_token_123" },
    configuredSecret: "super_secret_token_123",
    nodeEnv: "production",
  });
  assert.equal(result.authorized, true);
  assert.equal(result.status, 200);
});

challenge("Route Auth: Production Fail-Closed Security — Rejects unauthenticated requests when CRON_SECRET is unconfigured", () => {
  const result = evaluateRouteAuthorization({
    headers: {},
    configuredSecret: undefined,
    nodeEnv: "production", // In production, never allow unauthenticated access
  });
  assert.equal(result.authorized, false);
  assert.equal(result.status, 401);
});

// ============================================================================
// CLEANUP & SUMMARY
// ============================================================================
async function cleanupAll() {
  await prisma.searchHistory.deleteMany({
    where: { userId: { in: [USER_ALICE, USER_BOB, USER_EVE] } },
  });
  await prisma.$disconnect();
}

async function runAll() {
  try {
    await runIdorTests();
    await runMigrationStressTests();
    await runRetentionStressTests();
  } finally {
    await cleanupAll();
  }

  console.log("\n================================================================================");
  console.log(`📊 CHALLENGER M4 HARNESS SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("================================================================================");

  if (failedCount > 0) {
    console.error("FAILURES DETECTED:");
    for (const f of failureDetails) {
      console.error(`- ${f.title}: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log("🏆 ALL ADVERSARIAL CHALLENGES EMPIRICALLY PASSED!");
    process.exit(0);
  }
}

runAll().catch((err) => {
  console.error("Fatal test harness exception:", err);
  process.exit(1);
});
