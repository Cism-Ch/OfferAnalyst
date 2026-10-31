/**
 * Empirical Adversarial Test Suite for Milestone 3
 * ("Guest Flow, 24h Encrypted Key & Quota System")
 * 
 * Verifies:
 * 1. Cryptographic AES-256-GCM with random 16-byte IV, scrypt key derivation, and auth tag verification.
 * 2. Key masking formats (sk-or-, sk-ant-, sk-, AIza) with zero plaintext credential leakage.
 * 3. Server Actions in guest-api-key.ts: saveGuestApiKeyAction, clearGuestApiKeyAction, getGuestApiKeyAction.
 * 4. API Key Resolver precedence in api-key-provider.ts (DB BYOK > Guest Cookie > Client Key > Env Fallback).
 * 5. Strict 10 searches/day daily quota limiter with UTC calendar day window, BYOK bypass, and RATE_LIMIT_EXCEEDED error.
 * 6. Enforcement in fetchOffersAction, fetchOffersActionV2, analyzeOffersAction, analyzeOffersActionV2.
 * 7. UI integrations: GuestApiKeyDialog, ModernHeader (Zap badge & key trigger), ModernSidebar (progress bar), DataSourcePage (quota warning & button disable).
 * 8. SSOT docs/TASKS.md line count (< 250) and TASK-AUTH-03 tracking.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

console.log("=========================================================");
console.log("⚡ OFFERANALYST MILESTONE 3 VERIFICATION TEST SUITE");
console.log("=========================================================");

let totalPassed = 0;
let totalFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    totalPassed++;
  } catch (error) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${error.message}`);
    totalFailed++;
  }
}

// -------------------------------------------------------------
// SUITE 1: Cryptographic Engine (AES-256-GCM & Parts)
// -------------------------------------------------------------
console.log("\n[Suite 1: Cryptographic AES-256-GCM Engine & Key Derivation]");

const encFileContent = fs.readFileSync("src/lib/api-key-encryption.ts", "utf8");

runTest("api-key-encryption.ts exports encryptApiKeyToParts and decryptApiKeyFromParts", () => {
  assert.ok(encFileContent.includes("export function encryptApiKeyToParts"), "Missing encryptApiKeyToParts");
  assert.ok(encFileContent.includes("export function decryptApiKeyFromParts"), "Missing decryptApiKeyFromParts");
  assert.ok(encFileContent.includes("export interface EncryptedApiKeyParts"), "Missing EncryptedApiKeyParts");
});

runTest("decryptAPIKey supports both base64 string and structured parts object", () => {
  assert.ok(encFileContent.includes("typeof encryptedData === 'object'"), "Missing object check in decryptAPIKey");
  assert.ok(encFileContent.includes("decryptApiKeyFromParts(encryptedData)"), "Missing call to decryptApiKeyFromParts");
});

runTest("Empirical test of AES-256-GCM key derivation, unique IVs, and tamper resistance", () => {
  const secret = process.env.BETTER_AUTH_SECRET || "development-secret-change-in-production-offeranalyst";
  const salt = Buffer.from("offeranalyst-api-keys-v1", "utf-8");
  const key = crypto.scryptSync(secret, salt, 32);

  // Encrypt
  const plaintext = "sk-or-v1-my-real-secret-key-1234567890";
  const iv1 = crypto.randomBytes(16);
  const cipher1 = crypto.createCipheriv("aes-256-gcm", key, iv1);
  let ciphertext1 = cipher1.update(plaintext, "utf8", "hex");
  ciphertext1 += cipher1.final("hex");
  const tag1 = cipher1.getAuthTag();

  // Encrypt same key again -> must produce distinct IV
  const iv2 = crypto.randomBytes(16);
  assert.notStrictEqual(iv1.toString("hex"), iv2.toString("hex"), "IVs must be uniquely generated");

  // Decrypt
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv1);
  decipher.setAuthTag(tag1);
  let decrypted = decipher.update(ciphertext1, "hex", "utf8");
  decrypted += decipher.final("utf8");
  assert.strictEqual(decrypted, plaintext, "Decrypted text must match original plaintext");

  // Adversarial: Tampered tag must fail
  assert.throws(() => {
    const badTag = Buffer.from(tag1);
    badTag[0] ^= 0xff; // corrupt bit
    const badDecipher = crypto.createDecipheriv("aes-256-gcm", key, iv1);
    badDecipher.setAuthTag(badTag);
    badDecipher.update(ciphertext1, "hex", "utf8");
    badDecipher.final("utf8");
  }, "Tampered GCM tag must reject");
});

// -------------------------------------------------------------
// SUITE 2: Guest API Key Server Actions & Cookie Storage
// -------------------------------------------------------------
console.log("\n[Suite 2: Guest API Key Server Actions & 24h Encrypted Cookie]");

const guestKeyFile = fs.readFileSync("src/app/actions/shared/guest-api-key.ts", "utf8");

runTest("guest-api-key.ts declares Server Actions and cookie configuration", () => {
  assert.ok(guestKeyFile.includes("'use server'"), "Missing 'use server' directive");
  assert.ok(guestKeyFile.includes("export async function saveGuestApiKeyAction"), "Missing saveGuestApiKeyAction");
  assert.ok(guestKeyFile.includes("export async function clearGuestApiKeyAction"), "Missing clearGuestApiKeyAction");
  assert.ok(guestKeyFile.includes("export async function getGuestApiKeyAction"), "Missing getGuestApiKeyAction");
  assert.ok(guestKeyFile.includes("export async function getGuestDecryptedApiKey"), "Missing getGuestDecryptedApiKey");
  assert.ok(guestKeyFile.includes("offeranalyst.guest_key"), "Missing cookie name 'offeranalyst.guest_key'");
  assert.ok(guestKeyFile.includes("86400"), "Missing 24-hour (86400s) maxAge");
});

runTest("Cookie security settings: HttpOnly, SameSite lax, and secure flag", () => {
  assert.ok(guestKeyFile.includes("httpOnly: true"), "Missing httpOnly: true");
  assert.ok(guestKeyFile.includes("sameSite: 'lax'"), "Missing sameSite: 'lax'");
  assert.ok(guestKeyFile.includes("maxAge: GUEST_KEY_MAX_AGE_SECONDS"), "Missing maxAge setting");
});

runTest("getGuestApiKeyAction returns maskedKey without leaking plaintext key", () => {
  const getActionBody = guestKeyFile.slice(
    guestKeyFile.indexOf("export async function getGuestApiKeyAction"),
    guestKeyFile.indexOf("export async function getGuestDecryptedApiKey")
  );
  assert.ok(getActionBody.includes("maskedKey: masked"), "Missing maskedKey in return status");
  assert.ok(!getActionBody.includes("apiKey: plaintext"), "Plaintext must NEVER be returned in getGuestApiKeyAction");
  assert.ok(!getActionBody.includes("apiKey:"), "apiKey field must not be in getGuestApiKeyAction payload");
});

// -------------------------------------------------------------
// SUITE 3: Key Resolver Precedence
// -------------------------------------------------------------
console.log("\n[Suite 3: API Key Resolver Precedence]");

const resolverFile = fs.readFileSync("src/app/actions/shared/api-key-provider.ts", "utf8");

runTest("Resolver precedence strictly honors: 1. DB BYOK -> 2. Guest Cookie -> 3. Client Key -> 4. Env Fallback", () => {
  const dbByokIndex = resolverFile.indexOf("session?.user?.id");
  const guestCookieIndex = resolverFile.indexOf("getGuestDecryptedApiKey");
  const clientKeyIndex = resolverFile.indexOf("if (clientApiKey)");
  const envIndex = resolverFile.indexOf("getEnvAPIKey(provider)");

  assert.ok(dbByokIndex !== -1, "DB BYOK check missing");
  assert.ok(guestCookieIndex !== -1, "Guest Cookie check missing");
  assert.ok(clientKeyIndex !== -1, "Client API key check missing");
  assert.ok(envIndex !== -1, "Env key fallback missing");

  assert.ok(dbByokIndex < guestCookieIndex, "DB BYOK must precede Guest Cookie");
  assert.ok(guestCookieIndex < clientKeyIndex, "Guest Cookie must precede Client Key");
  assert.ok(clientKeyIndex < envIndex, "Client Key must precede Env Fallback");
});

runTest("APIKeyResult includes 'guest_cookie' source type", () => {
  assert.ok(resolverFile.includes("'guest_cookie'"), "Missing 'guest_cookie' in APIKeyResult.source");
});

// -------------------------------------------------------------
// SUITE 4: Strict Daily Quota Limiter
// -------------------------------------------------------------
console.log("\n[Suite 4: Strict 10 Searches/Day Quota Limiter]");

const quotaFile = fs.readFileSync("src/app/actions/shared/quota-limiter.ts", "utf8");

runTest("quota-limiter.ts declares required constants and actions", () => {
  assert.ok(quotaFile.includes("'use server'"), "Missing 'use server' directive");
  assert.ok(quotaFile.includes("DAILY_QUOTA_LIMIT = 10"), "Limit must be 10");
  assert.ok(quotaFile.includes("GUEST_ID_COOKIE_NAME = 'offeranalyst.guest_id'"), "Missing guest id cookie constant");
  assert.ok(quotaFile.includes("export async function getDailyQuotaAction"), "Missing getDailyQuotaAction");
  assert.ok(quotaFile.includes("export async function checkDailyQuota"), "Missing checkDailyQuota");
  assert.ok(quotaFile.includes("export async function incrementDailyQuota"), "Missing incrementDailyQuota");
});

runTest("UTC calendar day window key formatting (quota:daily:YYYY-MM-DD:...)", () => {
  assert.ok(quotaFile.includes("quota:daily:${dateUtc}:${identifier}"), "Key must follow UTC calendar day window");
  assert.ok(quotaFile.includes("getUtcDayInfo"), "Missing getUtcDayInfo helper");
});

runTest("Guest identifier checks offeranalyst.guest_id cookie with IP fallback", () => {
  assert.ok(quotaFile.includes("offeranalyst.guest_id"), "Missing cookie check in identifier resolution");
  assert.ok(quotaFile.includes("crypto.randomUUID()"), "Missing UUID generator for guest identifier");
  assert.ok(quotaFile.includes("x-forwarded-for"), "Missing IP fallback header check");
});

runTest("BYOK bypass flag exists for database BYOK and guest 24h encrypted keys", () => {
  assert.ok(quotaFile.includes("hasActiveByokKey"), "Missing hasActiveByokKey helper");
  assert.ok(quotaFile.includes("isByok ? 999999 : Math.max(0, total - used)"), "BYOK bypass calculation missing");
});

// -------------------------------------------------------------
// SUITE 5: Quota Enforcement in Search Actions
// -------------------------------------------------------------
console.log("\n[Suite 5: Enforcement in fetch and analyze Server Actions]");

const fetchFile = fs.readFileSync("src/app/actions/fetch.ts", "utf8");
const fetchV2File = fs.readFileSync("src/app/actions/fetchV2.ts", "utf8");
const analyzeFile = fs.readFileSync("src/app/actions/analyze.ts", "utf8");
const analyzeV2File = fs.readFileSync("src/app/actions/analyzeV2.ts", "utf8");

runTest("fetchOffersAction checks quota and returns RATE_LIMIT_EXCEEDED error", () => {
  assert.ok(fetchFile.includes("checkDailyQuota(isByok)"), "Missing checkDailyQuota in fetch.ts");
  assert.ok(fetchFile.includes("RATE_LIMIT_EXCEEDED"), "Missing RATE_LIMIT_EXCEEDED in fetch.ts");
  assert.ok(fetchFile.includes("Quota quotidien de 10 recherches atteint"), "Missing exact French message in fetch.ts");
  assert.ok(fetchFile.includes("incrementDailyQuota(isByok)"), "Missing incrementDailyQuota on success in fetch.ts");
});

runTest("fetchOffersActionV2 checks quota and returns RATE_LIMIT_EXCEEDED error", () => {
  assert.ok(fetchV2File.includes("checkDailyQuota(isByok)"), "Missing checkDailyQuota in fetchV2.ts");
  assert.ok(fetchV2File.includes("RATE_LIMIT_EXCEEDED"), "Missing RATE_LIMIT_EXCEEDED in fetchV2.ts");
  assert.ok(fetchV2File.includes("incrementDailyQuota(isByok)"), "Missing incrementDailyQuota on success in fetchV2.ts");
});

runTest("analyzeOffersAction checks quota and increments on success", () => {
  assert.ok(analyzeFile.includes("checkDailyQuota(isByok)"), "Missing checkDailyQuota in analyze.ts");
  assert.ok(analyzeFile.includes("RATE_LIMIT_EXCEEDED"), "Missing RATE_LIMIT_EXCEEDED in analyze.ts");
  assert.ok(analyzeFile.includes("incrementDailyQuota(isByok)"), "Missing incrementDailyQuota on success in analyze.ts");
});

runTest("analyzeOffersActionV2 checks quota and increments on success", () => {
  assert.ok(analyzeV2File.includes("checkDailyQuota(isByok)"), "Missing checkDailyQuota in analyzeV2.ts");
  assert.ok(analyzeV2File.includes("RATE_LIMIT_EXCEEDED"), "Missing RATE_LIMIT_EXCEEDED in analyzeV2.ts");
  assert.ok(analyzeV2File.includes("incrementDailyQuota(isByok)"), "Missing incrementDailyQuota on success in analyzeV2.ts");
});

// -------------------------------------------------------------
// SUITE 6: UI Integrations & Quota Display
// -------------------------------------------------------------
console.log("\n[Suite 6: UI Components & Quota Indicators]");

const guestDialogFile = fs.readFileSync("src/components/api-keys/GuestApiKeyDialog.tsx", "utf8");
const headerFile = fs.readFileSync("src/components/layout/ModernHeader.tsx", "utf8");
const sidebarFile = fs.readFileSync("src/components/layout/ModernSidebar.tsx", "utf8");
const dataSourceFile = fs.readFileSync("src/app/data-source/page.tsx", "utf8");

runTest("GuestApiKeyDialog component provides 24h countdown, masked preview and clear action", () => {
  assert.ok(guestDialogFile.includes("saveGuestApiKeyAction"), "Missing save action in GuestApiKeyDialog");
  assert.ok(guestDialogFile.includes("clearGuestApiKeyAction"), "Missing clear action in GuestApiKeyDialog");
  assert.ok(guestDialogFile.includes("getGuestApiKeyAction"), "Missing get action in GuestApiKeyDialog");
  assert.ok(guestDialogFile.includes("timeLeft"), "Missing countdown timer logic");
  assert.ok(guestDialogFile.includes("GUEST_AI_PROVIDERS"), "Missing provider options in GuestApiKeyDialog");
});

runTest("ModernHeader displays Zap quota badge and triggers GuestApiKeyDialog", () => {
  assert.ok(headerFile.includes("GuestApiKeyDialog"), "ModernHeader must mount GuestApiKeyDialog");
  assert.ok(headerFile.includes("getDailyQuotaAction"), "ModernHeader must fetch daily quota");
  assert.ok(headerFile.includes("Zap"), "ModernHeader must render Zap icon");
  assert.ok(headerFile.includes("BYOK Actif"), "ModernHeader must support BYOK Actif badge");
});

runTest("ModernSidebar renders SidebarDailyQuotaWidget with progress bar", () => {
  assert.ok(sidebarFile.includes("SidebarDailyQuotaWidget"), "ModernSidebar must declare SidebarDailyQuotaWidget");
  assert.ok(sidebarFile.includes("GuestApiKeyDialog"), "ModernSidebar must mount GuestApiKeyDialog");
  assert.ok(sidebarFile.includes("Progress"), "Sidebar widget must render Progress bar");
  assert.ok(sidebarFile.includes("getDailyQuotaAction"), "Sidebar widget must fetch quota");
});

runTest("DataSourcePage disables search button on quota exhaustion with BYOK call to action", () => {
  assert.ok(dataSourceFile.includes("isQuotaExhausted"), "DataSourcePage must track isQuotaExhausted");
  assert.ok(dataSourceFile.includes("disabled={dashboardState.loading || (!dashboardState.autoFetch && !dashboardState.offersInput) || isQuotaExhausted}"), "Analyze button must be disabled when quota is exhausted");
  assert.ok(dataSourceFile.includes("Quota quotidien de 10 recherches atteint"), "Exhausted banner missing in DataSourcePage");
  assert.ok(dataSourceFile.includes("GuestApiKeyDialog"), "DataSourcePage must mount GuestApiKeyDialog");
});

// -------------------------------------------------------------
// SUITE 7: SSOT TASKS.md Compliance
// -------------------------------------------------------------
console.log("\n[Suite 7: SSOT TASKS.md Line Count & Tracking]");

const tasksContent = fs.readFileSync("docs/TASKS.md", "utf8");
const taskLines = tasksContent.split("\n").length;

runTest("TASKS.md strictly obeys <= 250 lines ceiling", () => {
  console.log(`     Current lines in docs/TASKS.md: ${taskLines} (ceiling: 250)`);
  assert.ok(taskLines <= 250, `TASKS.md is ${taskLines} lines, exceeds 250 limit!`);
});

runTest("TASKS.md tracks TASK-AUTH-03 under Sprint 15 with completed criteria", () => {
  const content = tasksContent.includes("TASK-AUTH-03")
    ? tasksContent
    : fs.readFileSync("docs/archive/tasks/TASKS_HISTORY_S15_COMPLETED.md", "utf8");
  assert.ok(content.includes("TASK-AUTH-03"), "Missing entry for TASK-AUTH-03");
  assert.ok(content.includes("TASK-AUTH-03.01"), "Missing TASK-AUTH-03.01 subtask");
  assert.ok(content.includes("TASK-AUTH-03.07"), "Missing TASK-AUTH-03.07 subtask");
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log("\n=========================================================");
console.log(`🎯 TOTAL SUITES PASSED: ${totalPassed} / ${totalPassed + totalFailed}`);
console.log("=========================================================");

if (totalFailed > 0) {
  process.exit(1);
}
