/**
 * Independent Forensic Audit Suite for Milestone 4
 * Evaluated by auditor_m4 (Archetype: forensic_auditor)
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("=========================================================");
console.log("🔍 FORENSIC AUDITOR M4 INDEPENDENT INTEGRITY AUDIT");
console.log("=========================================================");

let passed = 0;
let failed = 0;

function auditCheck(name, fn) {
  try {
    fn();
    console.log(`  ✅ AUDIT PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ AUDIT FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
    failed++;
  }
}

async function asyncAuditCheck(name, fn) {
  try {
    await fn();
    console.log(`  ✅ AUDIT PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ AUDIT FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
    failed++;
  }
}

// -------------------------------------------------------------
// CHECK 1: Static Facade & Prohibited Patterns Audit
// -------------------------------------------------------------
console.log("\n[Audit 1: Static Code Analysis & Facade Detection]");

const historySrc = fs.readFileSync("src/app/actions/db/history.ts", "utf8");

auditCheck("history.ts has NO hardcoded test results or constant mock returns", () => {
  // Check for forbidden facade patterns
  assert.ok(!historySrc.includes("return { success: true, data: [] }"), "Found static array mock return in history.ts");
  assert.ok(!historySrc.includes("return [{ id: 'mock'"), "Found mock search history objects");
  assert.ok(!historySrc.includes("return { success: true, count: 42 }"), "Found hardcoded count return");
});

auditCheck("history.ts genuinely executes all required Prisma operations", () => {
  assert.ok(historySrc.includes("prisma.searchHistory.create("), "Missing genuine prisma.searchHistory.create");
  assert.ok(historySrc.includes("prisma.searchHistory.findMany("), "Missing genuine prisma.searchHistory.findMany");
  assert.ok(historySrc.includes("prisma.searchHistory.updateMany("), "Missing genuine prisma.searchHistory.updateMany");
  assert.ok(historySrc.includes("prisma.searchHistory.deleteMany("), "Missing genuine prisma.searchHistory.deleteMany");
  assert.ok(historySrc.includes("prisma.searchHistory.createMany("), "Missing genuine prisma.searchHistory.createMany");
  assert.ok(historySrc.includes("prisma.searchHistory.count("), "Missing genuine prisma.searchHistory.count");
});

auditCheck("history.ts strictly enforces anti-IDOR confinement to session userId", () => {
  assert.ok(historySrc.includes("auth.api.getSession"), "Missing auth.api.getSession server-side verification");
  assert.ok(historySrc.includes("const where = {\n      userId,"), "getUserSearchHistoryAction must strictly bind userId");
  assert.ok(historySrc.includes("where: {\n        id: parsed.data.id,\n        userId,\n      }"), "togglePinSearchAction must strictly bind id AND userId");
  assert.ok(historySrc.includes("where: {\n        id: parsed.data.id,\n        userId,\n      }"), "deleteSearchHistoryAction must strictly bind id AND userId");
  assert.ok(historySrc.includes("where: {\n        userId,\n        isPinned: false,\n      }"), "clearSearchHistoryAction must strictly bind userId AND isPinned: false");
});

// -------------------------------------------------------------
// CHECK 2: Dual Storage & 7-Day TTL Expiration Audit
// -------------------------------------------------------------
console.log("\n[Audit 2: Dual Storage Hook & 7-Day TTL Expiration]");

const hookSrc = fs.readFileSync("src/hooks/use-search-history.ts", "utf8");

auditCheck("use-search-history.ts genuinely defines 7-day TTL and purge logic", () => {
  assert.ok(hookSrc.includes("GUEST_RETENTION_MS = 7 * 24 * 60 * 60 * 1000"), "Incorrect or missing GUEST_RETENTION_MS 7-day constant");
  assert.ok(hookSrc.includes("item.expiresAt > now"), "Missing dynamic expiresAt check against Date.now()");
  assert.ok(hookSrc.includes("item.timestamp + GUEST_RETENTION_MS > now"), "Missing dynamic timestamp fallback TTL check");
  assert.ok(hookSrc.includes("purgeExpiredGuestItems"), "Missing purgeExpiredGuestItems function");
});

auditCheck("use-search-history.ts triggers guest-to-cloud migration on session transition", () => {
  assert.ok(hookSrc.includes("migrateGuestSearchesAction("), "Missing migrateGuestSearchesAction call on session transition");
  assert.ok(hookSrc.includes("window.localStorage.removeItem(GUEST_HISTORY_KEY)"), "Must clean local guest history after successful cloud migration");
});

// -------------------------------------------------------------
// CHECK 3: 90-Day Retention CRON & Pinned Immunity Audit
// -------------------------------------------------------------
console.log("\n[Audit 3: 90-Day Retention CRON Endpoint & Pinned Immunity]");

const cronSrc = fs.readFileSync("src/app/api/cron/cleanup-history/route.ts", "utf8");

auditCheck("cleanup-history route enforces 90-day cutoff and unconditional pinned immunity", () => {
  assert.ok(cronSrc.includes("RETENTION_DAYS = 90"), "Missing 90-day retention constant");
  assert.ok(cronSrc.includes("timestamp: { lt: cutoffDate }"), "Missing cutoffDate lt filter");
  assert.ok(cronSrc.includes("isPinned: false"), "Retention query MUST filter isPinned: false to preserve pinned entries");
  assert.ok(cronSrc.includes("CRON_SECRET"), "Missing CRON_SECRET security check");
  assert.ok(cronSrc.includes("getQStashReceiver"), "Missing QStash signature security check");
});

// -------------------------------------------------------------
// CHECK 4: Zero Tolerance & Project Standards Audit
// -------------------------------------------------------------
console.log("\n[Audit 4: Zero Tolerance & Project Standards]");

auditCheck("Environment files (.env and .env.local) exist and contain vital keys", () => {
  assert.ok(fs.existsSync(".env"), ".env file missing!");
  assert.ok(fs.existsSync(".env.local"), ".env.local file missing!");

  const envContent = fs.readFileSync(".env", "utf8");
  const envLocalContent = fs.readFileSync(".env.local", "utf8");

  assert.ok(envContent.includes("DATABASE_URL="), ".env missing DATABASE_URL");
  assert.ok(envContent.includes("BETTER_AUTH_SECRET="), ".env missing BETTER_AUTH_SECRET");
  assert.ok(envContent.includes("GOOGLE_CLIENT_ID="), ".env missing GOOGLE_CLIENT_ID");
  assert.ok(envContent.includes("GOOGLE_CLIENT_SECRET="), ".env missing GOOGLE_CLIENT_SECRET");

  assert.ok(envLocalContent.includes("DATABASE_URL="), ".env.local missing DATABASE_URL");
  assert.ok(envLocalContent.includes("BETTER_AUTH_SECRET="), ".env.local missing BETTER_AUTH_SECRET");
  assert.ok(envLocalContent.includes("GOOGLE_CLIENT_ID="), ".env.local missing GOOGLE_CLIENT_ID");
  assert.ok(envLocalContent.includes("GOOGLE_CLIENT_SECRET="), ".env.local missing GOOGLE_CLIENT_SECRET");
});

auditCheck("docs/TASKS.md is <= 250 lines strict ceiling", () => {
  const tasksContent = fs.readFileSync("docs/TASKS.md", "utf8");
  const lines = tasksContent.split("\n");
  console.log(`     docs/TASKS.md actual lines: ${lines.length}`);
  assert.ok(lines.length <= 250, `docs/TASKS.md exceeds 250 lines! (${lines.length})`);
  assert.ok(tasksContent.includes("TASK-AUTH-04"), "docs/TASKS.md missing TASK-AUTH-04");
});

auditCheck("Server Actions in history.ts strictly conform to { success: true, data } | { success: false, error }", () => {
  // Check return signatures
  assert.ok(historySrc.includes("Promise<{ success: true; data: SearchHistory } | { success: false; error: string }>"));
  assert.ok(historySrc.includes("Promise<{ success: true; data: SearchHistory[]; total: number } | { success: false; error: string }>"));
  assert.ok(historySrc.includes("Promise<{ success: true } | { success: false; error: string }>"));
  assert.ok(historySrc.includes("Promise<{ success: true; count: number } | { success: false; error: string }>"));
});

// -------------------------------------------------------------
// CHECK 5: Empirical Database Sanity Test
// -------------------------------------------------------------
console.log("\n[Audit 5: Live Database Verification on MongoDB Atlas]");

async function runLiveAudit() {
  await prisma.$connect();

  const AUDIT_USER = "671000000000000000000099";

  await asyncAuditCheck("Database connection & live insertion verification", async () => {
    const created = await prisma.searchHistory.create({
      data: {
        userId: AUDIT_USER,
        domain: "Forensic Audit Domain",
        criteria: "Auditor Verification Query",
        model: "auditor-test",
        resultCount: 99,
        isPinned: false,
      },
    });

    assert.ok(created.id, "Expected valid MongoDB ObjectID");
    assert.equal(created.userId, AUDIT_USER);

    // Verify retrieval
    const retrieved = await prisma.searchHistory.findUnique({
      where: { id: created.id },
    });
    assert.ok(retrieved);
    assert.equal(retrieved.domain, "Forensic Audit Domain");

    // Clean up
    await prisma.searchHistory.delete({ where: { id: created.id } });

    // Verify deletion
    const postDelete = await prisma.searchHistory.findUnique({
      where: { id: created.id },
    });
    assert.equal(postDelete, null);
  });

  await prisma.$disconnect();

  console.log("\n=========================================================");
  console.log(`🎯 AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runLiveAudit().catch((e) => {
  console.error("Live audit failure:", e);
  process.exit(1);
});
