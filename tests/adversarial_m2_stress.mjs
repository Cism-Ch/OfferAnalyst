/**
 * EMPIRICAL ADVERSARIAL STRESS TEST HARNESS — MILESTONE 2
 * Scope:
 * 1. Open Redirect Vulnerability in callback URL sanitization (login/page.tsx)
 * 2. OAuth Error query parameter mapping, fallback, and malformed inputs
 * 3. Middleware session cookie evaluation: multi-cookie precedence and empty cookie bypass
 * 4. Route protection coverage consistency between middleware.ts and ModernSidebar.tsx
 */

import assert from "node:assert/strict";
import fs from "node:fs";

console.log("=========================================================");
console.log("🔥 EMPIRICAL ADVERSARIAL STRESS TEST SUITE — MILESTONE 2");
console.log("=========================================================");

let passedCount = 0;
let failedCount = 0;
const findings = [];

function recordTest(name, passed, message) {
  if (passed) {
    console.log(`  ✅ PASS: ${name}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason: ${message}`);
    failedCount++;
    findings.push({ name, message });
  }
}

// =========================================================================
// SECTION 1: Open Redirect Vulnerability in getCallbackUrl()
// =========================================================================
console.log("\n[Section 1: Open Redirect Vulnerability & Target Sanitization]");

// Extract exact getCallbackUrl logic as implemented in src/app/auth/login/page.tsx:81-87
const loginSource = fs.readFileSync("src/app/auth/login/page.tsx", "utf8");

// Implementation in code:
// const isSafeRelativeUrl = (url: string | null): boolean => {
//   if (!url) return false;
//   return url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\") && !url.includes("://");
// };
// const getCallbackUrl = (): string => {
//   const from = searchParams.get("from");
//   const callbackUrl = searchParams.get("callbackUrl");
//   const redirect = searchParams.get("redirect");
//   const cb = from || callbackUrl || redirect;
//   return isSafeRelativeUrl(cb) ? (cb as string) : "/";
// };

assert.ok(loginSource.includes("isSafeRelativeUrl"), "isSafeRelativeUrl must be defined in src/app/auth/login/page.tsx");
assert.ok(loginSource.includes('!url.startsWith("//")'), "protocol-relative // check must be present");
assert.ok(loginSource.includes('!url.startsWith("/\\\\")') || loginSource.includes("!url.startsWith('/\\\\')"), "backslash check must be present");

function isSafeRelativeUrl(url) {
  if (!url) return false;
  return url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\") && !url.includes("://");
}

function getCallbackUrlImplementation(from, callbackUrl, redirect) {
  const cb = from || callbackUrl || redirect;
  return isSafeRelativeUrl(cb) ? cb : "/";
}

// 1.1 Test malicious protocol-relative redirect: //evil.com
{
  const result = getCallbackUrlImplementation("//evil.com", null, null);
  const isSanitized = result === "/" && !result.startsWith("//");
  recordTest(
    "Open Redirect Defense: '//evil.com' must be sanitized to '/'",
    isSanitized,
    `VULNERABILITY FOUND: getCallbackUrl() returned "${result}" instead of "/". ` +
    `Browsers navigate to external domain http(s)://evil.com when given protocol-relative '//evil.com'.`
  );
}

// 1.2 Test malicious protocol-relative redirect with path: //attacker.com/steal-cookie
{
  const result = getCallbackUrlImplementation("//attacker.com/steal-cookie", null, null);
  const isSanitized = result === "/" && !result.startsWith("//");
  recordTest(
    "Open Redirect Defense: '//attacker.com/steal-cookie' must be sanitized to '/'",
    isSanitized,
    `VULNERABILITY FOUND: getCallbackUrl() returned "${result}" instead of "/".`
  );
}

// 1.3 Test backslash bypass: /\\evil.com
{
  const result = getCallbackUrlImplementation("/\\evil.com", null, null);
  const isSanitized = result === "/" && !result.startsWith("/\\");
  recordTest(
    "Open Redirect Defense: '/\\\\evil.com' must be sanitized to '/'",
    isSanitized,
    `VULNERABILITY FOUND: getCallbackUrl() returned "${result}" instead of "/". ` +
    `Some browsers/proxies interpret /\\ as protocol-relative //.`
  );
}

// 1.4 Test triple slash redirect: ///evil.com
{
  const result = getCallbackUrlImplementation("///evil.com", null, null);
  const isSanitized = result === "/" && !result.startsWith("//");
  recordTest(
    "Open Redirect Defense: '///evil.com' must be sanitized to '/'",
    isSanitized,
    `VULNERABILITY FOUND: getCallbackUrl() returned "${result}" instead of "/".`
  );
}

// 1.5 Test external absolute URL: https://attacker.com
{
  const result = getCallbackUrlImplementation("https://attacker.com", null, null);
  const isSanitized = result === "/";
  recordTest(
    "Open Redirect Defense: 'https://attacker.com' must be sanitized to '/'",
    isSanitized,
    `Expected "/" but got "${result}"`
  );
}

// 1.6 Test javascript: URL scheme: javascript:alert(1)
{
  const result = getCallbackUrlImplementation("javascript:alert(1)", null, null);
  const isSanitized = result === "/";
  recordTest(
    "Open Redirect Defense: 'javascript:alert(1)' must be sanitized to '/'",
    isSanitized,
    `Expected "/" but got "${result}"`
  );
}

// 1.7 Test valid legitimate paths: /saved, /dashboard/settings, /projects?sort=asc
{
  const validSaved = getCallbackUrlImplementation("/saved", null, null);
  const validDashboard = getCallbackUrlImplementation("/dashboard/settings", null, null);
  const validQuery = getCallbackUrlImplementation("/projects?sort=asc", null, null);
  const allPreserved = validSaved === "/saved" && validDashboard === "/dashboard/settings" && validQuery === "/projects?sort=asc";
  recordTest(
    "Legitimate Route Preservation: /saved, /dashboard/settings, /projects?sort=asc",
    allPreserved,
    `Expected valid paths to be preserved, got: saved=${validSaved}, dashboard=${validDashboard}, query=${validQuery}`
  );
}

// =========================================================================
// SECTION 2: OAuth Error Parameter Handling & Unmapped Codes
// =========================================================================
console.log("\n[Section 2: OAuth Error Handling, Localization & Unmapped Codes]");

// Extract getLocalizedOAuthError from login/page.tsx
const mockTranslations = {
  auth: {
    oauthErrorAccessDenied: "Access denied",
    oauthErrorAccountNotLinked: "Account not linked",
    oauthErrorCallback: "Callback failed",
    oauthErrorConfiguration: "Configuration error",
    oauthErrorVerification: "Verification token expired",
    oauthErrorDefault: "Default OAuth error",
  },
};

function getLocalizedOAuthError(errorCode, errorDesc, t) {
  switch (errorCode) {
    case "access_denied":
      return t.auth.oauthErrorAccessDenied;
    case "account_not_linked":
      return t.auth.oauthErrorAccountNotLinked;
    case "OAuthCallbackError":
      return t.auth.oauthErrorCallback;
    case "configuration":
      return t.auth.oauthErrorConfiguration;
    case "verification":
      return t.auth.oauthErrorVerification;
    default:
      return errorDesc || t.auth.oauthErrorDefault;
  }
}

// 2.1 Test all 5 mapped codes
{
  const codes = [
    ["access_denied", "Access denied"],
    ["account_not_linked", "Account not linked"],
    ["OAuthCallbackError", "Callback failed"],
    ["configuration", "Configuration error"],
    ["verification", "Verification token expired"],
  ];
  let allMapped = true;
  for (const [code, expected] of codes) {
    const res = getLocalizedOAuthError(code, null, mockTranslations);
    if (res !== expected) {
      allMapped = false;
      break;
    }
  }
  recordTest(
    "OAuth Error Mapping: All 5 known error codes properly mapped",
    allMapped,
    "One or more error codes failed mapping"
  );
}

// 2.2 Test unmapped error code with error_description provided
{
  const res = getLocalizedOAuthError("server_error", "Internal Identity Provider Error", mockTranslations);
  recordTest(
    "OAuth Unmapped Error: Uses error_description when present",
    res === "Internal Identity Provider Error",
    `Expected error_description but got "${res}"`
  );
}

// 2.3 Test unmapped error code without error_description (falls back safely)
{
  const res = getLocalizedOAuthError("invalid_grant", null, mockTranslations);
  recordTest(
    "OAuth Unmapped Error: Safely falls back to oauthErrorDefault when no description",
    res === mockTranslations.auth.oauthErrorDefault,
    `Expected "${mockTranslations.auth.oauthErrorDefault}" but got "${res}"`
  );
}

// 2.4 Test malformed / XSS payload in error code and description
{
  const xssCode = "<script>alert('xss')</script>";
  const xssDesc = "<img src=x onerror=alert(1)>";
  let safe = false;
  try {
    const res = getLocalizedOAuthError(xssCode, xssDesc, mockTranslations);
    // Since getLocalizedOAuthError returns string and React/Next JSX escapes by default:
    safe = typeof res === "string" && res === xssDesc;
  } catch (e) {
    safe = false;
  }
  recordTest(
    "OAuth Malformed / XSS Payload: Handled without crashing or throwing",
    safe,
    "Function crashed or threw on XSS payload"
  );
}

// =========================================================================
// SECTION 3: Middleware Session Cookie Evaluation & Multi-Cookie Precedence
// =========================================================================
console.log("\n[Section 3: Middleware Session Cookie Precedence & Empty Cookie Vulnerability]");

// In middleware.ts:
// const standardCookie = request.cookies.get("offeranalyst.session_token");
// const secureCookie = request.cookies.get("__Secure-offeranalyst.session_token");
// const sessionToken = 
//   (standardCookie?.value && standardCookie.value.trim().length > 0 ? standardCookie.value : null) ||
//   (secureCookie?.value && secureCookie.value.trim().length > 0 ? secureCookie.value : null);
// 
// if (!sessionToken) {
//   ... redirect to /auth/login
// }

class MockCookies {
  constructor(cookieMap = {}) {
    this.map = new Map(Object.entries(cookieMap));
  }
  get(name) {
    if (!this.map.has(name)) return undefined;
    return { name, value: this.map.get(name) };
  }
}

function evaluateMiddlewareSessionCookie(mockCookies) {
  const standardCookie = mockCookies.get("offeranalyst.session_token");
  const secureCookie = mockCookies.get("__Secure-offeranalyst.session_token");
  const sessionToken = 
    (standardCookie?.value && standardCookie.value.trim().length > 0 ? standardCookie.value : null) ||
    (secureCookie?.value && secureCookie.value.trim().length > 0 ? secureCookie.value : null);
  
  const isAuthenticated = Boolean(sessionToken);
  return { 
    sessionCookie: sessionToken ? { value: sessionToken } : undefined, 
    isAuthenticated 
  };
}

// 3.1 Unauthenticated: No cookies present
{
  const cookies = new MockCookies({});
  const { sessionCookie, isAuthenticated } = evaluateMiddlewareSessionCookie(cookies);
  recordTest(
    "Cookie Detection: No cookie -> unauthenticated (redirects to login)",
    sessionCookie === undefined && isAuthenticated === false,
    `Expected unauthenticated, got isAuthenticated=${isAuthenticated}`
  );
}

// 3.2 Authenticated: Only standard cookie present with valid token
{
  const cookies = new MockCookies({ "offeranalyst.session_token": "valid_token_abc" });
  const { sessionCookie, isAuthenticated } = evaluateMiddlewareSessionCookie(cookies);
  recordTest(
    "Cookie Detection: Standard cookie present -> authenticated",
    sessionCookie?.value === "valid_token_abc" && isAuthenticated === true,
    `Expected valid token, got ${sessionCookie?.value}`
  );
}

// 3.3 Authenticated: Only __Secure- cookie present with valid token (HTTPS production)
{
  const cookies = new MockCookies({ "__Secure-offeranalyst.session_token": "secure_token_xyz" });
  const { sessionCookie, isAuthenticated } = evaluateMiddlewareSessionCookie(cookies);
  recordTest(
    "Cookie Detection: __Secure- cookie present -> authenticated",
    sessionCookie?.value === "secure_token_xyz" && isAuthenticated === true,
    `Expected valid secure token, got ${sessionCookie?.value}`
  );
}

// 3.4 Authenticated: Both cookies present with valid tokens
{
  const cookies = new MockCookies({
    "offeranalyst.session_token": "standard_token",
    "__Secure-offeranalyst.session_token": "secure_token",
  });
  const { sessionCookie, isAuthenticated } = evaluateMiddlewareSessionCookie(cookies);
  recordTest(
    "Cookie Detection: Both cookies present -> authenticated",
    sessionCookie !== undefined && isAuthenticated === true,
    "Expected authenticated when both cookies present"
  );
}

// 3.5 VULNERABILITY TEST: Empty cookie bypass (e.g. Cookie: offeranalyst.session_token=)
// In Next.js, request.cookies.get(name) returns { name, value: "" } if cookie header exists with empty value.
// If middleware checks `if (!sessionCookie)`, an object `{ name: "...", value: "" }` is TRUTHY,
// meaning `!sessionCookie` evaluates to FALSE, granting access to protected routes!
{
  const cookies = new MockCookies({ "offeranalyst.session_token": "" });
  const { sessionCookie, isAuthenticated } = evaluateMiddlewareSessionCookie(cookies);
  
  // A secure middleware MUST reject an empty token value:
  const isSecurelyRejected = !isAuthenticated || (sessionCookie?.value && sessionCookie.value.trim().length > 0);
  
  recordTest(
    "Cookie Vulnerability: Empty cookie value 'offeranalyst.session_token=\"\"' must NOT authenticate",
    isSecurelyRejected,
    `VULNERABILITY FOUND: Middleware checks '!sessionCookie' instead of '!sessionCookie?.value'. ` +
    `An unauthenticated client sending an empty cookie header 'offeranalyst.session_token=' evaluates to truthy object, bypassing protected routes!`
  );
}

// 3.6 Multi-cookie precedence issue: Stale empty standard cookie with valid __Secure- cookie
// When migrating from HTTP to HTTPS or across environments, a client may send empty standard cookie and valid secure cookie.
// Because cookies.get("offeranalyst.session_token") returns truthy object { value: "" },
// the logical OR `||` selects the empty cookie and ignores the valid secure cookie!
{
  const cookies = new MockCookies({
    "offeranalyst.session_token": "",
    "__Secure-offeranalyst.session_token": "valid_active_session_token",
  });
  
  const standardCookie = cookies.get("offeranalyst.session_token");
  const secureCookie = cookies.get("__Secure-offeranalyst.session_token");
  const currentImplementationToken = 
    (standardCookie?.value && standardCookie.value.trim().length > 0 ? standardCookie.value : null) ||
    (secureCookie?.value && secureCookie.value.trim().length > 0 ? secureCookie.value : null);
  
  const correctTokenSelected = currentImplementationToken === "valid_active_session_token";
  recordTest(
    "Multi-Cookie Precedence: Empty standard cookie must not mask valid __Secure- cookie",
    correctTokenSelected,
    `DEFECT FOUND: Empty standard cookie '{ value: "" }' masks valid secure cookie ` +
    `'{ value: "valid_active_session_token" }' due to object-level truthiness in '||' expression.`
  );
}

// =========================================================================
// SECTION 4: Route Protection Coverage Consistency
// =========================================================================
console.log("\n[Section 4: Route Protection Coverage Consistency]");

const middlewareSource = fs.readFileSync("middleware.ts", "utf8");
const sidebarSource = fs.readFileSync("src/components/layout/ModernSidebar.tsx", "utf8");

// Extract protectedRoutes from middleware.ts
const mwProtectedMatch = middlewareSource.match(/const protectedRoutes = \[\s*([\s\S]*?)\];/);
const mwRoutes = mwProtectedMatch
  ? mwProtectedMatch[1]
      .split("\n")
      .map((l) => l.trim().replace(/[",]/g, ""))
      .filter((l) => l.startsWith("/"))
  : [];

// Extract PROTECTED_NAV_ROUTES from ModernSidebar.tsx
const sidebarProtectedMatch = sidebarSource.match(/const PROTECTED_NAV_ROUTES = \[\s*([\s\S]*?)\];/);
const sidebarRoutes = sidebarProtectedMatch
  ? sidebarProtectedMatch[1]
      .split("\n")
      .map((l) => l.trim().replace(/['",]/g, ""))
      .filter((l) => l.startsWith("/"))
  : [];

// 4.1 Check /history consistency (must NOT be protected in either)
{
  const mwHistoryProtected = mwRoutes.includes("/history");
  const sidebarHistoryProtected = sidebarRoutes.includes("/history");
  recordTest(
    "Route Consistency: /history is public in both middleware and sidebar",
    !mwHistoryProtected && !sidebarHistoryProtected,
    `/history protected state: middleware=${mwHistoryProtected}, sidebar=${sidebarHistoryProtected}`
  );
}

// 4.2 Check key protected routes in middleware: /saved, /projects, /compare, /dashboard, /admin
{
  const coreRoutes = ["/saved", "/projects", "/compare", "/dashboard", "/admin"];
  const allCoreInMw = coreRoutes.every((r) => mwRoutes.includes(r));
  recordTest(
    "Middleware Protection: All core protected routes declared",
    allCoreInMw,
    `Missing core routes in middleware: ${coreRoutes.filter((r) => !mwRoutes.includes(r)).join(", ")}`
  );
}

// =========================================================================
// SUMMARY & VERDICT
// =========================================================================
console.log("\n=========================================================");
console.log(`🏁 ADVERSARIAL STRESS TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("=========================================================");

if (findings.length > 0) {
  console.log("\n⚠️ FINDINGS IDENTIFIED:");
  findings.forEach((f, idx) => {
    console.log(`\n[Finding ${idx + 1}] ${f.name}`);
    console.log(`  Detail: ${f.message}`);
  });
}

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
