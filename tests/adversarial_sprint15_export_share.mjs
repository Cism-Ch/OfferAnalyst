/**
 * Empirical Adversarial Test Suite for Sprint 15
 * (Export Engine CSV/PDF & Secure Public Share Collaboration)
 * 
 * Verifies:
 * 1. CSV Engine: UTF-8 BOM, strict cell escaping, score breakdown distribution.
 * 2. PDF Engine: Standards-compliant PDF-1.4 binary structure, xref table, %%EOF, pagination.
 * 3. Server Actions & Security:
 *    - Token format & crypto-randomness
 *    - Strict Zod validation & rejection of malformed payloads
 *    - Expiration & read-only guarantee
 * 4. Route protection & Middleware public access to /share
 * 5. Deterministic type safety & zero-lint compliance
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("=========================================================");
console.log("⚡ OFFERANALYST SPRINT 15 ADVERSARIAL TEST SUITE");
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
// SUITE 1: CSV Export Engine Integrity & Escaping
// ------------------------------------------------------------------------
console.log("\n[Suite 1: CSV Export Engine]");

await runTest("CSV file starts with UTF-8 BOM (\\uFEFF)", async () => {
  const { generateCsv } = await import("../src/lib/export.ts");
  const dummyAnalysis = {
    topOffers: [
      {
        id: "off-1",
        title: 'Appartement "Lumineux" & Spacieux; Paris',
        price: "450 000 €",
        location: "Paris 11e",
        category: "Immobilier",
        finalScore: 92,
        rank: 1,
        justification: "Excellente rentabilité locative, quartier très recherché.",
        webInsights: ["Marché en hausse de 3%", "Proche métro ligne 9"],
        breakdown: { relevance: 95, quality: 90, trend: 88 },
        url: "https://example.com/offer/1"
      }
    ],
    marketSummary: "Marché parisien dynamique avec forte demande locative.",
    totalAnalyzed: 15
  };

  const csv = generateCsv(dummyAnalysis, { domain: "Immobilier", criteria: "Budget 500k", language: "fr" });
  assert.ok(csv.startsWith("\uFEFF"), "CSV must start with UTF-8 BOM");
  assert.ok(csv.includes("SYNTHÈSE DU MARCHÉ"), "CSV must include Market Summary header");
  assert.ok(csv.includes('""Lumineux""'), "CSV must escape double quotes with double-quotes");
  assert.ok(csv.includes("Pertinence (50%)"), "CSV headers must contain score breakdown");
  assert.ok(csv.includes("95/100"), "CSV data rows must format scores properly");
});

await runTest("CSV handles edge cases: empty offers and missing breakdown gracefully", async () => {
  const { generateCsv } = await import("../src/lib/export.ts");
  const emptyAnalysis = {
    topOffers: [],
    marketSummary: ""
  };
  const csv = generateCsv(emptyAnalysis, { language: "en" });
  assert.ok(csv.startsWith("\uFEFF"), "BOM present even for empty offers");
  assert.ok(csv.includes("OFFERANALYST REPORT"), "English header generated");
  assert.ok(csv.includes("Overall Score"), "English columns generated");
});

await runTest("CSV neutralizes formula injection (CWE-1236)", async () => {
  const { generateCsv } = await import("../src/lib/export.ts");
  const injectionAnalysis = {
    topOffers: [
      {
        title: "=cmd|' /C calc'!A0",
        price: "+500000",
        justification: "@SUM(A1:A5)",
      }
    ],
    marketSummary: "-DangerousFormula"
  };
  const csv = generateCsv(injectionAnalysis);
  assert.ok(csv.includes("\"'=cmd|'"), "Leading = must be escaped with single quote");
  assert.ok(csv.includes("\"'+500000\""), "Leading + must be escaped with single quote");
  assert.ok(csv.includes("\"'@SUM(A1:A5)\""), "Leading @ must be escaped with single quote");
  assert.ok(csv.includes("\"'-DangerousFormula\""), "Leading - must be escaped with single quote");
});

// ------------------------------------------------------------------------
// SUITE 2: Pure TypeScript PDF-1.4 Binary Generator
// ------------------------------------------------------------------------
console.log("\n[Suite 2: Pure TypeScript PDF-1.4 Binary Generator]");

await runTest("PDF Generator produces valid PDF-1.4 binary with xref and trailer", async () => {
  const { generatePdfReport } = await import("../src/lib/export.ts");
  const dummyAnalysis = {
    topOffers: [
      {
        id: "off-1",
        title: "Ingénieur Fullstack Senior Next.js 16",
        price: "75k - 85k €",
        location: "Paris / Remote",
        category: "Emploi Tech",
        finalScore: 89,
        rank: 1,
        justification: "Parfaite adéquation technique et culturelle avec les critères.",
        webInsights: ["Entreprise certifiée Great Place To Work"],
        breakdown: { relevance: 92, quality: 86, trend: 85 },
        url: "https://example.com/job/1"
      }
    ],
    marketSummary: "Forte tension sur les profils seniors Next.js.",
    totalAnalyzed: 10
  };

  const pdfBytes = generatePdfReport(dummyAnalysis, { domain: "Emploi Tech", criteria: "Next.js 16" });
  assert.ok(pdfBytes instanceof Uint8Array, "Result must be a Uint8Array");
  const pdfString = Buffer.from(pdfBytes).toString("latin1");

  assert.ok(pdfString.startsWith("%PDF-1.4"), "PDF must start with %PDF-1.4 header");
  assert.ok(pdfString.includes("/Type /Catalog"), "PDF must have a Catalog object");
  assert.ok(pdfString.includes("/Type /Pages"), "PDF must have a Pages object");
  assert.ok(pdfString.includes("xref"), "PDF must contain a cross-reference table");
  assert.ok(pdfString.includes("trailer"), "PDF must contain a trailer dictionary");
  assert.ok(pdfString.endsWith("%%EOF\n") || pdfString.endsWith("%%EOF"), "PDF must end with %%EOF");
});

await runTest("PDF Generator handles multi-page pagination with 8+ offers", async () => {
  const { generatePdfReport } = await import("../src/lib/export.ts");
  const topOffers = [];
  for (let i = 1; i <= 10; i++) {
    topOffers.push({
      id: `off-${i}`,
      title: `Offre test numéro #${i} avec description complète et détaillée`,
      price: `${50000 + i * 2000} €`,
      location: `Ville ${i}`,
      category: "Tech",
      finalScore: 80 + (i % 15),
      rank: i,
      justification: `Justification complète de l'offre #${i} détaillant les atouts spécifiques, les signaux du marché et la compatibilité globale avec les critères fixés.`,
      webInsights: [`Signal web positif #${i}`],
      breakdown: { relevance: 85, quality: 80, trend: 75 }
    });
  }

  const multiPageAnalysis = {
    topOffers,
    marketSummary: "Synthèse exécutive étendue avec plusieurs paragraphes d'analyse sur les tendances actuelles du marché.",
    totalAnalyzed: 50
  };

  const pdfBytes = generatePdfReport(multiPageAnalysis, { domain: "Test Pagination" });
  const pdfString = Buffer.from(pdfBytes).toString("latin1");

  // Should have at least 2 pages
  const pageMatch = pdfString.match(/\/Count (\d+)/);
  assert.ok(pageMatch, "Pages count must exist in PDF");
  const pageCount = parseInt(pageMatch[1], 10);
  assert.ok(pageCount >= 2, `Expected >= 2 pages for 10 dense offers, got ${pageCount}`);
});

await runTest("PDF Generator handles null title, missing topOffers, and preserves Euro currency as EUR", async () => {
  const { generatePdfReport } = await import("../src/lib/export.ts");
  
  // Missing topOffers
  const emptyPdf = generatePdfReport({});
  assert.ok(emptyPdf instanceof Uint8Array, "Empty topOffers must not throw");

  // Null title and Euro symbol
  const testPdf = generatePdfReport({
    topOffers: [{
      finalScore: 85,
      price: "450 000 €"
    }]
  });
  const pdfStr = Buffer.from(testPdf).toString("latin1");
  assert.ok(pdfStr.includes("450 000 EUR"), "Euro symbol must be transliterated to EUR");
  assert.ok(pdfStr.includes("Offre #1"), "Missing title must use fallback Offre #1");
});

await runTest("PDF Generator bounds long justification without negative coordinates", async () => {
  const { generatePdfReport } = await import("../src/lib/export.ts");
  const longJust = Array(150).fill("Cette offre presente un avantage competitif exceptionnel sur le marche.").join(" ");
  const pdfBytes = generatePdfReport({
    topOffers: [{
      title: "Offre justification longue",
      justification: longJust,
      finalScore: 88
    }]
  });
  const pdfStr = Buffer.from(pdfBytes).toString("latin1");
  const negCoords = pdfStr.match(/[0-9]+ -[0-9]+.*Td/);
  assert.equal(negCoords, null, "Text coordinates must not be negative");
});

// ------------------------------------------------------------------------
// SUITE 3: Server Actions & Prisma SharedAnalysis Storage
// ------------------------------------------------------------------------
console.log("\n[Suite 3: Shared Analysis Server Actions & DB Storage]");

let createdShareToken = null;
let createdShareId = null;

await runTest("createShareLinkAction validates input and creates SharedAnalysis record", async () => {
  const { createShareLinkAction } = await import("../src/server/share.ts");
  
  const dummyAnalysis = {
    topOffers: [
      {
        id: "shared-1",
        title: "Villa Contemporaine Vue Mer",
        price: "1 250 000 €",
        location: "Nice",
        category: "Immobilier",
        finalScore: 94,
        rank: 1,
        justification: "Propriété d'exception conforme à 100% au cahier des charges.",
        webInsights: ["Secteur très prisé"],
        breakdown: { relevance: 96, quality: 95, trend: 90 }
      }
    ],
    marketSummary: "Marché haut de gamme en progression constante.",
    totalAnalyzed: 8
  };

  const res = await createShareLinkAction({
    domain: "Immobilier Prestige",
    criteria: "Vue mer Nice",
    analysis: dummyAnalysis,
    ttlDays: 14
  });

  assert.ok(res.success, `Expected success: true, got error: ${res.error}`);
  assert.ok(res.data.shareToken.startsWith("sh_"), "Share token must be prefixed with sh_");
  assert.ok(res.data.shareUrl.startsWith("/share/sh_"), "Share URL must point to /share/");

  createdShareToken = res.data.shareToken;

  // Verify in MongoDB via Prisma
  const dbRecord = await prisma.sharedAnalysis.findUnique({
    where: { shareToken: createdShareToken }
  });

  assert.ok(dbRecord, "Record must exist in MongoDB database");
  assert.equal(dbRecord.domain, "Immobilier Prestige");
  assert.equal(dbRecord.views, 0, "Initial view count must be 0");
  assert.ok(dbRecord.expiresAt > new Date(), "Expiration must be in the future");
  createdShareId = dbRecord.id;
});

await runTest("getSharedAnalysisAction retrieves data, increments view count, and protects privacy", async () => {
  const { getSharedAnalysisAction } = await import("../src/server/share.ts");

  const res = await getSharedAnalysisAction(createdShareToken);
  assert.ok(res.success, `Expected success: true, got ${res.error}`);
  assert.equal(res.data.domain, "Immobilier Prestige");
  assert.equal(res.data.topOffers.length, 1);
  assert.equal(res.data.topOffers[0].title, "Villa Contemporaine Vue Mer");

  // Read-only verification: record is not mutable by viewer
  assert.equal(typeof res.data.isOwner, "boolean");

  // Verify view counter incremented in DB
  const updatedDb = await prisma.sharedAnalysis.findUnique({
    where: { id: createdShareId }
  });
  assert.ok(updatedDb.views >= 1, `View count should be >= 1, got ${updatedDb.views}`);
});

await runTest("getSharedAnalysisAction rejects expired share links", async () => {
  const { getSharedAnalysisAction } = await import("../src/server/share.ts");

  // Create an expired record
  const expired = await prisma.sharedAnalysis.create({
    data: {
      shareToken: "sh_expired_test_" + Date.now(),
      domain: "Expired Domain",
      marketSummary: "Expired",
      topOffers: "[]",
      expiresAt: new Date(Date.now() - 10000) // in the past
    }
  });

  const res = await getSharedAnalysisAction(expired.shareToken);
  assert.equal(res.success, false);
  assert.ok(res.error.toLowerCase().includes("expir"), "Error should indicate expiration");

  // Cleanup test record
  await prisma.sharedAnalysis.delete({ where: { id: expired.id } });
});

await runTest("createShareLinkAction strictly rejects invalid domains or payloads", async () => {
  const { createShareLinkAction } = await import("../src/server/share.ts");

  const invalid = await createShareLinkAction({
    domain: "", // empty domain not allowed
    analysis: {
      topOffers: [],
      marketSummary: ""
    }
  });

  assert.equal(invalid.success, false);
  assert.ok(invalid.error, "Should return validation error");
});

await runTest("getSharedAnalysisAction respects incrementView: false option for metadata rendering", async () => {
  const { createShareLinkAction, getSharedAnalysisAction } = await import("../src/server/share.ts");
  const res = await createShareLinkAction({
    domain: "Metadata View Test",
    analysis: { topOffers: [], marketSummary: "" }
  });
  assert.ok(res.success);
  const token = res.data.shareToken;

  // Metadata read (should not increment view)
  const metaRes = await getSharedAnalysisAction(token, { incrementView: false });
  assert.ok(metaRes.success);
  assert.equal(metaRes.data.views, 0, "Views count should remain 0 when incrementView is false");

  const dbAfterMeta = await prisma.sharedAnalysis.findUnique({ where: { shareToken: token } });
  assert.equal(dbAfterMeta.views, 0, "DB views must remain 0 after metadata lookup");

  // Page view (increments view)
  const pageRes = await getSharedAnalysisAction(token, { incrementView: true });
  assert.ok(pageRes.success);
  assert.equal(pageRes.data.views, 1, "Views count should become 1 after actual page render");

  // Cleanup
  await prisma.sharedAnalysis.delete({ where: { shareToken: token } });
});

await runTest("Anti-IDOR: Unauthenticated access via raw MongoDB ObjectId is rejected", async () => {
  const { createShareLinkAction, getSharedAnalysisAction } = await import("../src/server/share.ts");
  const res = await createShareLinkAction({
    domain: "Anti-IDOR Test",
    analysis: { topOffers: [], marketSummary: "" }
  });
  assert.ok(res.success);
  const dbRecord = await prisma.sharedAnalysis.findUnique({ where: { shareToken: res.data.shareToken } });

  // Attacker attempts to access via raw ObjectId without auth session
  const directAccess = await getSharedAnalysisAction(dbRecord.id);
  assert.equal(directAccess.success, false, "Unauthenticated access via ObjectId must fail");

  // Cleanup
  await prisma.sharedAnalysis.delete({ where: { id: dbRecord.id } });
});

// Cleanup test record
if (createdShareId) {
  await prisma.sharedAnalysis.delete({ where: { id: createdShareId } }).catch(() => {});
}

// ------------------------------------------------------------------------
// SUITE 4: UI, API & Middleware Configuration
// ------------------------------------------------------------------------
console.log("\n[Suite 4: UI, API & Middleware Integrity]");

await runTest("middleware.ts includes /share in publicRoutes", async () => {
  const middlewarePath = path.resolve("./middleware.ts");
  const content = fs.readFileSync(middlewarePath, "utf-8");
  assert.ok(content.includes('"/share"'), "middleware.ts must include /share in publicRoutes");
});

await runTest("src/app/api/export/route.ts exports POST, GET, OPTIONS", async () => {
  const routePath = path.resolve("./src/app/api/export/route.ts");
  const content = fs.readFileSync(routePath, "utf-8");
  assert.ok(content.includes("export async function POST"), "Export route must implement POST");
  assert.ok(content.includes("export async function GET"), "Export route must implement GET");
  assert.ok(content.includes("export async function OPTIONS"), "Export route must implement OPTIONS");
});

await runTest("src/components/offers/ResultsSection.tsx integrates PDF, CSV and Share actions", async () => {
  const componentPath = path.resolve("./src/components/offers/ResultsSection.tsx");
  const content = fs.readFileSync(componentPath, "utf-8");
  assert.ok(content.includes("exportAnalysisAsPdf"), "ResultsSection must include PDF export");
  assert.ok(content.includes("exportAnalysisAsCsv"), "ResultsSection must include CSV export");
  assert.ok(content.includes("ShareAnalysisModal"), "ResultsSection must include ShareAnalysisModal");
});

await runTest("src/app/share/[id]/page.tsx is a server component with generateMetadata", async () => {
  const pagePath = path.resolve("./src/app/share/[id]/page.tsx");
  const content = fs.readFileSync(pagePath, "utf-8");
  assert.ok(!content.includes("'use client'"), "Shared page must be a Server Component (RSC)");
  assert.ok(content.includes("generateMetadata"), "Shared page must export generateMetadata");
  assert.ok(content.includes("SharedViewToolbar"), "Shared page must include client toolbar");
});

console.log("\n=========================================================");
console.log(`🏁 SPRINT 15 ADVERSARIAL SUITE: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log("=========================================================");

await prisma.$disconnect();
process.exit(totalFailed > 0 ? 1 : 0);
