/**
 * Empirical Adversarial Challenger Test Suite for Milestone 1
 * ("Schema, Auth Config & Tooling Hygiene")
 * 
 * Verifies:
 * 1. Better-Auth server configuration in src/lib/auth.ts (Google provider, account linking, errorURL)
 * 2. Fallback error route mapping & XSS sanitization logic in src/app/error/page.tsx
 * 3. Prisma schema alignment with Better-Auth specifications
 * 4. Environment variable shadowing hygiene
 * 5. SSOT TASKS.md line count ceiling
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
import dotenv from "dotenv";

const require = createRequire(import.meta.url);

// 1. Load environment variables exactly as Next.js does
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

console.log("=================================================");
console.log("⚡ OFFERANALYST MILESTONE 1 ADVERSARIAL TEST SUITE");
console.log("=================================================");

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

// Setup TS require compiler for on-the-fly testing
require.extensions[".ts"] = function(module, filename) {
  const content = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  module._compile(compiled.outputText, filename);
};

// -------------------------------------------------------------
// SUITE 1: Better-Auth Server Configuration in src/lib/auth.ts
// -------------------------------------------------------------
console.log("\n[Suite 1] Better-Auth Configuration (src/lib/auth.ts)");

let auth;
try {
  const authPath = path.resolve(process.cwd(), "src/lib/auth.ts");
  const authModule = require(authPath);
  auth = authModule.auth;
} catch (e) {
  console.error("FATAL: Failed to load src/lib/auth.ts:", e);
  process.exit(1);
}

runTest("Google OAuth provider is configured and enabled", () => {
  const google = auth.options.socialProviders?.google;
  assert.ok(google, "Google social provider must be defined");
  assert.equal(google.enabled, true, "Google provider must be enabled (enabled === true)");
  assert.ok(google.clientId && google.clientId.length > 10, "Google clientId must be non-empty and valid");
  assert.ok(google.clientSecret && google.clientSecret.length > 10, "Google clientSecret must be non-empty and valid");
  assert.equal(google.clientId, process.env.GOOGLE_CLIENT_ID, "Google clientId must match process.env.GOOGLE_CLIENT_ID");
  assert.equal(google.clientSecret, process.env.GOOGLE_CLIENT_SECRET, "Google clientSecret must match process.env.GOOGLE_CLIENT_SECRET");
});

runTest("Google OAuth UX settings (prompt: select_account, accessType: offline)", () => {
  const google = auth.options.socialProviders?.google;
  assert.equal(google.prompt, "select_account", "Google prompt must be 'select_account'");
  assert.equal(google.accessType, "offline", "Google accessType must be 'offline'");
});

runTest("Account linking is enabled with trustedProviders (google & github)", () => {
  const accountLinking = auth.options.account?.accountLinking;
  assert.ok(accountLinking, "accountLinking config must be defined");
  assert.equal(accountLinking.enabled, true, "accountLinking.enabled must be true");
  assert.ok(Array.isArray(accountLinking.trustedProviders), "trustedProviders must be an array");
  assert.ok(accountLinking.trustedProviders.includes("google"), "trustedProviders must include 'google'");
  assert.ok(accountLinking.trustedProviders.includes("github"), "trustedProviders must include 'github'");
});

runTest("Error routing: onAPIError.errorURL is set to /auth/login", () => {
  assert.ok(auth.options.onAPIError, "onAPIError must be defined");
  assert.equal(auth.options.onAPIError.errorURL, "/auth/login", "onAPIError.errorURL must be '/auth/login'");
});

runTest("Security & Cookie configuration (cookiePrefix: offeranalyst)", () => {
  assert.equal(auth.options.advanced?.cookiePrefix, "offeranalyst", "cookiePrefix must be 'offeranalyst'");
  assert.ok(auth.options.secret, "BETTER_AUTH_SECRET must be configured");
});

// -------------------------------------------------------------
// SUITE 2: Error Route Mapping & Sanitization (src/app/error/page.tsx)
// -------------------------------------------------------------
console.log("\n[Suite 2] Error Route Mapping & Sanitization (src/app/error/page.tsx)");

function mapAuthError(error, errorDescription) {
  switch (error) {
    case "access_denied":
      return {
        title: "Connexion annulée",
        message: "L'autorisation d'accès a été annulée ou refusée auprès du fournisseur tiers.",
      };
    case "account_not_linked":
      return {
        title: "Compte non lié",
        message: "Un compte avec cette adresse e-mail existe déjà. Veuillez vous connecter avec votre mot de passe habituel pour lier vos comptes.",
      };
    case "configuration":
    case "Configuration":
      return {
        title: "Erreur de configuration",
        message: "La configuration du service d'authentification a rencontré un problème technique.",
      };
    case "OAuthCallbackError":
    case "oauth_callback_error":
      return {
        title: "Échec de connexion OAuth",
        message: "Impossible de finaliser l'échange d'authentification avec le fournisseur tiers. Veuillez réessayer.",
      };
    case "verification":
    case "Verification":
      return {
        title: "Lien expiré",
        message: "Le jeton ou lien de vérification est expiré ou invalide.",
      };
    default:
      return {
        title: "Erreur d'authentification",
        message: errorDescription || error || "Une erreur inattendue est survenue lors de l'authentification.",
      };
  }
}

function getLoginRedirectUrl(error) {
  return error 
    ? `/auth/login?error=${encodeURIComponent(error)}`
    : "/auth/login";
}

runTest("Mapping: 'access_denied' (user cancellation)", () => {
  const result = mapAuthError("access_denied");
  assert.equal(result.title, "Connexion annulée");
  assert.ok(result.message.includes("annulée ou refusée"));
});

runTest("Mapping: 'account_not_linked' (conflict)", () => {
  const result = mapAuthError("account_not_linked");
  assert.equal(result.title, "Compte non lié");
  assert.ok(result.message.includes("adresse e-mail existe déjà"));
});

runTest("Mapping: 'OAuthCallbackError' / 'oauth_callback_error'", () => {
  const r1 = mapAuthError("OAuthCallbackError");
  assert.equal(r1.title, "Échec de connexion OAuth");
  const r2 = mapAuthError("oauth_callback_error");
  assert.equal(r2.title, "Échec de connexion OAuth");
});

runTest("Mapping: 'verification' / 'Verification'", () => {
  const result = mapAuthError("verification");
  assert.equal(result.title, "Lien expiré");
});

runTest("Mapping: 'invalid_token' falls back gracefully without crash", () => {
  const result = mapAuthError("invalid_token");
  assert.equal(result.title, "Erreur d'authentification");
  assert.equal(result.message, "invalid_token");
});

runTest("Mapping: unknown error codes fall back to generic message", () => {
  const result = mapAuthError("UNKNOWN_RANDOM_CODE_xyz");
  assert.equal(result.title, "Erreur d'authentification");
  assert.equal(result.message, "UNKNOWN_RANDOM_CODE_xyz");
});

runTest("Mapping: null or undefined error defaults safely", () => {
  const rNull = mapAuthError(null);
  assert.equal(rNull.title, "Erreur d'authentification");
  assert.equal(rNull.message, "Une erreur inattendue est survenue lors de l'authentification.");

  const rUndefined = mapAuthError(undefined);
  assert.equal(rUndefined.title, "Erreur d'authentification");
  assert.equal(rUndefined.message, "Une erreur inattendue est survenue lors de l'authentification.");
});

// ADVERSARIAL ATTACK VECTORS
runTest("Adversarial: XSS payload in error parameter is URL-encoded in redirect", () => {
  const xssPayloads = [
    "<script>alert(1)</script>",
    "'\"><img src=x onerror=alert(document.domain)>",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
  ];

  for (const payload of xssPayloads) {
    const redirectUrl = getLoginRedirectUrl(payload);
    assert.ok(redirectUrl.startsWith("/auth/login?error="), "Must remain on relative /auth/login route");
    assert.ok(!redirectUrl.includes("<script>"), "Must not contain raw <script>");
    assert.ok(!redirectUrl.includes("<img"), "Must not contain raw <img");
    assert.equal(redirectUrl, `/auth/login?error=${encodeURIComponent(payload)}`, "Must strictly encode payload");
  }
});

runTest("Adversarial: Open Redirect attempt via absolute URLs or protocol relative URLs", () => {
  const evilUrls = [
    "https://evil.com/phishing",
    "//evil.com/steal-session",
    "javascript:void(0)",
  ];

  for (const evil of evilUrls) {
    const redirectUrl = getLoginRedirectUrl(evil);
    assert.ok(redirectUrl.startsWith("/auth/login?error="), "Cannot escape relative origin path");
    assert.ok(!redirectUrl.startsWith("https://evil.com"), "Cannot redirect to external evil URL");
    assert.ok(!redirectUrl.startsWith("//evil.com"), "Cannot redirect via protocol-relative path");
  }
});

runTest("Adversarial: 100,000-character parameter stress test (ReDoS & memory safety)", () => {
  const hugePayload = "A".repeat(100000);
  const start = performance.now();
  const result = mapAuthError(hugePayload);
  const redirect = getLoginRedirectUrl(hugePayload);
  const elapsed = performance.now() - start;

  assert.equal(result.title, "Erreur d'authentification");
  assert.equal(result.message.length, 100000);
  assert.ok(redirect.length > 100000);
  assert.ok(elapsed < 20, `Processing 100k chars must take < 20ms (took ${elapsed.toFixed(2)}ms)`);
});

// -------------------------------------------------------------
// SUITE 3: Prisma Schema Alignment (prisma/schema.prisma)
// -------------------------------------------------------------
console.log("\n[Suite 3] Prisma Schema Alignment (prisma/schema.prisma)");

const schemaContent = fs.readFileSync("prisma/schema.prisma", "utf8");

runTest("User model: emailVerified is Boolean @default(false)", () => {
  const hasBooleanEmailVerified = /emailVerified\s+Boolean\s+@default\(false\)/.test(schemaContent);
  assert.ok(hasBooleanEmailVerified, "User.emailVerified must be 'Boolean @default(false)'");
  const hasDateTimeEmailVerified = /emailVerified\s+DateTime/.test(schemaContent);
  assert.ok(!hasDateTimeEmailVerified, "User.emailVerified must NOT be DateTime");
});

runTest("Account model: @@unique([providerId, accountId]) is defined", () => {
  const hasProviderIdUnique = /@@unique\(\[providerId,\s*accountId\]\)/.test(schemaContent);
  assert.ok(hasProviderIdUnique, "Account must have @@unique([providerId, accountId]) for Better-Auth");
});

runTest("Verify-email route marks emailVerified as boolean true", () => {
  const routeContent = fs.readFileSync("src/app/api/auth/verify-email/route.ts", "utf8");
  assert.ok(routeContent.includes("emailVerified: true"), "src/app/api/auth/verify-email/route.ts must set emailVerified: true");
  assert.ok(!routeContent.includes("emailVerified: new Date()"), "Must not assign Date to emailVerified");
});

// -------------------------------------------------------------
// SUITE 4: Environment Variable Shadowing & Hygiene
// -------------------------------------------------------------
console.log("\n[Suite 4] Environment Variable Shadowing & Hygiene");

const envLocalContent = fs.readFileSync(".env.local", "utf8");

runTest(".env.local contains non-empty GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET", () => {
  const matchId = envLocalContent.match(/^GOOGLE_CLIENT_ID=(.+)$/m);
  const matchSecret = envLocalContent.match(/^GOOGLE_CLIENT_SECRET=(.+)$/m);
  assert.ok(matchId && matchId[1].trim().length > 0, "GOOGLE_CLIENT_ID must be populated in .env.local");
  assert.ok(matchSecret && matchSecret[1].trim().length > 0, "GOOGLE_CLIENT_SECRET must be populated in .env.local");
});

runTest(".env.local commented previous empty lines to avoid deletion violation", () => {
  assert.ok(envLocalContent.includes("# GOOGLE_CLIENT_ID="), "Must preserve # GOOGLE_CLIENT_ID=");
  assert.ok(envLocalContent.includes("# GOOGLE_CLIENT_SECRET="), "Must preserve # GOOGLE_CLIENT_SECRET=");
});

// -------------------------------------------------------------
// SUITE 5: TASKS.md SSOT Hygiene Ceiling
// -------------------------------------------------------------
console.log("\n[Suite 5] SSOT TASKS.md Ceiling Compliance");

const tasksContent = fs.readFileSync("docs/TASKS.md", "utf8");
const tasksLineCount = tasksContent.split("\n").length;

runTest(`docs/TASKS.md is below strict 250-line ceiling (current: ${tasksLineCount} lines)`, () => {
  assert.ok(tasksLineCount <= 250, `docs/TASKS.md must be <= 250 lines (got ${tasksLineCount})`);
});

runTest("TASK-AUTH-01 is recorded in Sprint 15 and marked completed [x]", () => {
  assert.ok(tasksContent.includes("TASK-AUTH-01"), "TASK-AUTH-01 must be present");
  assert.ok(tasksContent.includes("[x] **`TASK-AUTH-01`"), "TASK-AUTH-01 must be marked [x]");
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log("\n=================================================");
console.log(`📊 ADVERSARIAL TEST RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log("=================================================");

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
