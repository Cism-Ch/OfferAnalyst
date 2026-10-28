/**
 * Empirical Adversarial Challenger Test Suite for Milestone 2
 * ("Route Protection, Middleware & OAuth UX")
 * 
 * Verifies:
 * 1. Middleware route protection, cookie detection (__Secure- and standard), and /history unprotection
 * 2. Login & Signup page callback URL preservation (from parameter) and errorCallbackURL
 * 3. OAuth error capture, translation of 5 critical codes, and toast/alert presentation
 * 4. FluidAuthModal component architecture and Radix Dialog accessibility
 * 5. ModernSidebar fluid auth modal integration for guests
 * 6. SSOT TASKS.md line count and sprint tracking
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("=========================================================");
console.log("⚡ OFFERANALYST MILESTONE 2 VERIFICATION TEST SUITE");
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
// SUITE 1: Middleware Route Protection & Cookie Detection
// -------------------------------------------------------------
console.log("\n[Suite 1: Middleware & Session Cookie Detection]");

const middlewareContent = fs.readFileSync("middleware.ts", "utf8");

runTest("Middleware checks both standard and __Secure- session cookies", () => {
  assert.ok(
    middlewareContent.includes('request.cookies.get("offeranalyst.session_token")'),
    "Standard cookie check missing"
  );
  assert.ok(
    middlewareContent.includes('request.cookies.get("__Secure-offeranalyst.session_token")'),
    "__Secure- cookie check missing"
  );
});

runTest("Middleware unprotects /history for guest users (R2 requirement)", () => {
  assert.ok(
    middlewareContent.includes('"/history"'),
    "/history not declared in middleware"
  );
  // Ensure /history is in publicRoutes
  const publicRoutesMatch = middlewareContent.match(/const publicRoutes = \[\s*([\s\S]*?)\];/);
  assert.ok(publicRoutesMatch, "publicRoutes array not found");
  assert.ok(
    publicRoutesMatch[1].includes('"/history"'),
    "/history must be inside publicRoutes"
  );

  // Ensure /history is NOT in protectedRoutes
  const protectedRoutesMatch = middlewareContent.match(/const protectedRoutes = \[\s*([\s\S]*?)\];/);
  assert.ok(protectedRoutesMatch, "protectedRoutes array not found");
  assert.ok(
    !protectedRoutesMatch[1].includes('"/history"'),
    "/history must NOT be inside protectedRoutes"
  );
});

runTest("Middleware preserves target pathname via 'from' search parameter", () => {
  assert.ok(
    middlewareContent.includes('loginUrl.searchParams.set("from", pathname)'),
    "Middleware must set 'from' search param with pathname"
  );
});

// -------------------------------------------------------------
// SUITE 2: Login & Signup Callback URL & Error Callback Handling
// -------------------------------------------------------------
console.log("\n[Suite 2: Login & Signup URL & Error Callback Handling]");

const loginContent = fs.readFileSync("src/app/auth/login/page.tsx", "utf8");
const signupContent = fs.readFileSync("src/app/auth/signup/page.tsx", "utf8");

runTest("Login page checks 'from' parameter in getCallbackUrl()", () => {
  assert.ok(
    loginContent.includes('searchParams.get("from")'),
    "searchParams.get('from') missing in login/page.tsx"
  );
  assert.ok(
    loginContent.includes('from || callbackUrl || redirect'),
    "Callback URL resolution must prioritize 'from' or include it with fallback"
  );
});

runTest("Login page passes errorCallbackURL: '/auth/login' to signIn.social", () => {
  assert.ok(
    loginContent.includes('errorCallbackURL: "/auth/login"'),
    "errorCallbackURL missing in login/page.tsx signIn.social"
  );
});

runTest("Signup page passes errorCallbackURL: '/auth/login' to signIn.social", () => {
  assert.ok(
    signupContent.includes('errorCallbackURL: "/auth/login"'),
    "errorCallbackURL missing in signup/page.tsx signIn.social"
  );
});

runTest("Login page wraps search params component in Suspense boundary", () => {
  assert.ok(
    loginContent.includes("<Suspense"),
    "Suspense wrapper missing in login/page.tsx"
  );
  assert.ok(
    loginContent.includes("useSearchParams()"),
    "useSearchParams hook missing in login/page.tsx"
  );
});

// -------------------------------------------------------------
// SUITE 3: OAuth Error Translation & Visual Feedback
// -------------------------------------------------------------
console.log("\n[Suite 3: OAuth Error Translation & Visual Feedback]");

runTest("Login page handles all 5 required error codes", () => {
  const requiredCodes = [
    "access_denied",
    "account_not_linked",
    "OAuthCallbackError",
    "configuration",
    "verification",
  ];

  for (const code of requiredCodes) {
    assert.ok(
      loginContent.includes(`"${code}"`),
      `Error code "${code}" not handled in login/page.tsx`
    );
  }
});

runTest("LanguageContext defines OAuth error translations for FR and EN", () => {
  const langContent = fs.readFileSync("src/contexts/LanguageContext.tsx", "utf8");
  const keys = [
    "oauthErrorAccessDenied",
    "oauthErrorAccountNotLinked",
    "oauthErrorCallback",
    "oauthErrorConfiguration",
    "oauthErrorVerification",
    "oauthErrorDefault",
  ];

  for (const key of keys) {
    const occurrences = (langContent.match(new RegExp(key, "g")) || []).length;
    assert.ok(
      occurrences >= 2,
      `Key ${key} must exist in both fr and en translation sets (found ${occurrences})`
    );
  }
});

runTest("Login page triggers useToast().error on OAuth error detection", () => {
  assert.ok(
    loginContent.includes("toast.error("),
    "useToast error dispatch missing in login/page.tsx"
  );
  assert.ok(
    loginContent.includes("displayError"),
    "Inline motion error banner must render displayError"
  );
});

// -------------------------------------------------------------
// SUITE 4: Fluid Authentication Modal for Guests
// -------------------------------------------------------------
console.log("\n[Suite 4: FluidAuthModal Component]");

const fluidModalPath = "src/components/auth/FluidAuthModal.tsx";

runTest("FluidAuthModal file exists and uses Radix Dialog primitives", () => {
  assert.ok(fs.existsSync(fluidModalPath), "FluidAuthModal.tsx does not exist");
  const modalContent = fs.readFileSync(fluidModalPath, "utf8");
  assert.ok(
    modalContent.includes("@/components/ui/dialog"),
    "Dialog primitive import missing"
  );
  assert.ok(
    modalContent.includes("DialogContent") && modalContent.includes("DialogHeader"),
    "Dialog elements missing"
  );
});

runTest("FluidAuthModal provides 1-click Google OAuth and Email navigation", () => {
  const modalContent = fs.readFileSync(fluidModalPath, "utf8");
  assert.ok(
    modalContent.includes('signIn.social({'),
    "signIn.social call missing in modal"
  );
  assert.ok(
    modalContent.includes('provider: "google"'),
    "Google OAuth provider missing in modal"
  );
  assert.ok(
    modalContent.includes('errorCallbackURL: "/auth/login"'),
    "errorCallbackURL missing in modal"
  );
  assert.ok(
    modalContent.includes('handleNavigate("/auth/login")') &&
    modalContent.includes('handleNavigate("/auth/signup")'),
    "Email login and signup handlers missing in modal"
  );
});

runTest("FluidAuthModal details account benefits (cloud history, saved offers, BYOK)", () => {
  const modalContent = fs.readFileSync(fluidModalPath, "utf8");
  assert.ok(
    modalContent.includes("fluidModalBenefitHistoryTitle"),
    "History benefit missing"
  );
  assert.ok(
    modalContent.includes("fluidModalBenefitSavedTitle"),
    "Saved offers benefit missing"
  );
  assert.ok(
    modalContent.includes("fluidModalBenefitApiTitle"),
    "API keys benefit missing"
  );
});

// -------------------------------------------------------------
// SUITE 5: ModernSidebar Guest Flow Integration
// -------------------------------------------------------------
console.log("\n[Suite 5: ModernSidebar Guest Interception]");

const sidebarContent = fs.readFileSync("src/components/layout/ModernSidebar.tsx", "utf8");

runTest("ModernSidebar mounts FluidAuthModal", () => {
  assert.ok(
    sidebarContent.includes("<FluidAuthModal"),
    "FluidAuthModal not mounted in ModernSidebar"
  );
});

runTest("ModernSidebar intercepts clicks for unauthenticated guests on protected items", () => {
  assert.ok(
    sidebarContent.includes("PROTECTED_NAV_ROUTES"),
    "PROTECTED_NAV_ROUTES list missing"
  );
  assert.ok(
    sidebarContent.includes("isGuest"),
    "isGuest state check missing"
  );
  assert.ok(
    sidebarContent.includes("onProtectedClick"),
    "onProtectedClick callback missing"
  );
  // Ensure /saved and /projects are in PROTECTED_NAV_ROUTES
  assert.ok(
    sidebarContent.includes("'/saved'") && sidebarContent.includes("'/projects'"),
    "/saved and /projects must be protected in sidebar"
  );
  // Ensure /history is NOT in PROTECTED_NAV_ROUTES
  const protectedRoutesMatch = sidebarContent.match(/const PROTECTED_NAV_ROUTES = \[\s*([\s\S]*?)\];/);
  assert.ok(protectedRoutesMatch, "PROTECTED_NAV_ROUTES array not found");
  assert.ok(
    !protectedRoutesMatch[1].includes("'/history'"),
    "/history must NOT be restricted for guests in ModernSidebar"
  );
});

// -------------------------------------------------------------
// SUITE 6: SSOT Governance in docs/TASKS.md
// -------------------------------------------------------------
console.log("\n[Suite 6: SSOT Governance & TASKS.md Integrity]");

const tasksContent = fs.readFileSync("docs/TASKS.md", "utf8");
const lines = tasksContent.split("\n");

runTest("docs/TASKS.md contains TASK-AUTH-02 with complete criteria", () => {
  assert.ok(
    tasksContent.includes("TASK-AUTH-02"),
    "TASK-AUTH-02 not found in docs/TASKS.md"
  );
  assert.ok(
    tasksContent.includes("TASK-AUTH-02.01") &&
    tasksContent.includes("TASK-AUTH-02.02") &&
    tasksContent.includes("TASK-AUTH-02.03") &&
    tasksContent.includes("TASK-AUTH-02.04") &&
    tasksContent.includes("TASK-AUTH-02.05") &&
    tasksContent.includes("TASK-AUTH-02.06"),
    "All sub-tasks 02.01 to 02.06 must be recorded"
  );
});

runTest("docs/TASKS.md respects strict ceiling (< 250 lines)", () => {
  assert.ok(
    lines.length < 250,
    `docs/TASKS.md line count (${lines.length}) exceeds 250 lines ceiling`
  );
});

console.log("\n=========================================================");
console.log(`🏁 RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log("=========================================================");

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
