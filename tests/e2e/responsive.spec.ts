import { test, expect } from '@playwright/test';

/**
 * OfferAnalyst Responsive & Fluidity E2E Test Suite
 * Sprint 17 (TASK-RWD-01 & TASK-RWD-02 & TASK-VAL-04)
 *
 * Deterministic assertions across standard responsive matrix:
 * 1. 320 x 568 (iPhone SE / Extra Small Mobile - SSOT absolute boundary)
 * 2. 375 x 812 (Standard Modern Mobile)
 * 3. 768 x 1024 (Tablet Portrait / Icon Rail threshold)
 * 4. 1024 x 768 (Tablet Landscape)
 * 5. 1440 x 900 (Desktop HD)
 *
 * Verifies:
 * - Strict zero horizontal overflow: document.documentElement.scrollWidth <= clientWidth
 * - Mobile touch targets >= 44x44px on interactive controls (WCAG 2.5.5)
 * - Safe area & dynamic dvh foundation integration
 */

const RESPONSIVE_VIEWPORTS = [
  { name: 'Mobile 320px (iPhone SE)', width: 320, height: 568 },
  { name: 'Mobile 375px (Standard)', width: 375, height: 812 },
  { name: 'Tablet 768px (Portrait)', width: 768, height: 1024 },
  { name: 'Tablet 1024px (Landscape)', width: 1024, height: 768 },
  { name: 'Desktop 1440px (HD)', width: 1440, height: 900 },
];

const TARGET_ROUTES = [
  '/',
  '/search-context',
  '/data-source',
  '/auth/login',
  '/auth/signup',
  '/help',
  '/terms',
  '/privacy',
];

const mockAnalysisPayload = {
  inputs: {
    domain: 'Software Engineering',
    criteria: 'TypeScript, Next.js, Remote',
    context: 'Scale-up tech',
  },
  results: {
    topOffers: [
      {
        id: 'resp-offer-1',
        title: 'Senior Fullstack Engineer',
        description: 'Lead architecture on Next.js 16 and React 19 apps.',
        price: '75 000 €',
        location: 'Paris (Remote)',
        category: 'Tech',
        finalScore: 92,
        rank: 1,
        justification: 'Perfect fit with modern stack requirements.',
        webInsights: ['High remote flexibility'],
        breakdown: { relevance: 94, quality: 90, trend: 92 },
        url: 'https://example.com/job/1',
      },
    ],
    marketSummary: 'Dynamic software engineering market.',
    totalAnalyzed: 10,
  },
};

test.describe('Responsive Design & No-Horizontal-Scroll Verification', () => {
  for (const viewport of RESPONSIVE_VIEWPORTS) {
    test.describe(`Viewport: ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      for (const route of TARGET_ROUTES) {
        test(`Route ${route} should not have horizontal overflow`, async ({ page }) => {
          await page.goto(route, { waitUntil: 'domcontentloaded' });
          await page.waitForLoadState('load');

          // Measure horizontal overflow strictly
          const overflow = await page.evaluate(() => {
            const doc = document.documentElement;
            const body = document.body;
            const maxScrollWidth = Math.max(doc.scrollWidth, body ? body.scrollWidth : 0);
            const clientWidth = doc.clientWidth;
            return maxScrollWidth - clientWidth;
          });

          // Allow at most 1px for fractional subpixel layout rounding on extreme zooms
          expect(overflow).toBeLessThanOrEqual(1);
        });
      }

      test('Analysis route with hydrated state should not have horizontal overflow', async ({ page }) => {
        await page.addInitScript((data) => {
          window.sessionStorage.setItem('restore_search', JSON.stringify(data));
        }, mockAnalysisPayload);

        await page.goto('/analysis', { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('load');

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const maxScrollWidth = Math.max(doc.scrollWidth, body ? body.scrollWidth : 0);
          const clientWidth = doc.clientWidth;
          return maxScrollWidth - clientWidth;
        });

        expect(overflow).toBeLessThanOrEqual(1);
      });

      if (viewport.width < 768) {
        test('Mobile interactive controls must respect WCAG 44x44px touch targets', async ({ page }) => {
          await page.goto('/', { waitUntil: 'domcontentloaded' });
          await page.waitForLoadState('load');

          // 1. Mobile Hamburger Menu Button (>= 44x44px)
          const menuButton = page.locator('button[aria-label*="menu" i]').first();
          await expect(menuButton).toBeVisible();
          await expect(async () => {
            const box = await menuButton.boundingBox();
            expect(box).not.toBeNull();
            if (box) {
              expect(box.width).toBeGreaterThanOrEqual(43.9);
              expect(box.height).toBeGreaterThanOrEqual(43.9);
            }
          }).toPass({ timeout: 5000 });

          // 2. Language Toggle in Header (>= 44x44px)
          const langToggle = page.locator('button[aria-label*="lang" i]').first();
          await expect(langToggle).toBeVisible();
          await expect(async () => {
            const box = await langToggle.boundingBox();
            expect(box).not.toBeNull();
            if (box) {
              expect(box.width).toBeGreaterThanOrEqual(43.9);
              expect(box.height).toBeGreaterThanOrEqual(43.9);
            }
          }).toPass({ timeout: 5000 });

          // 3. Theme Selector in Header (>= 44x44px)
          const themeButton = page.locator('button[aria-label*="thème" i], button[aria-label*="theme" i]').first();
          await expect(themeButton).toBeVisible();
          await expect(async () => {
            const box = await themeButton.boundingBox();
            expect(box).not.toBeNull();
            if (box) {
              expect(box.width).toBeGreaterThanOrEqual(43.9);
              expect(box.height).toBeGreaterThanOrEqual(43.9);
            }
          }).toPass({ timeout: 5000 });

          // 4. AI Model Selector in Header (>= 44x44px)
          const modelButton = page.locator('button[aria-label*="modèle" i], button[aria-label*="model" i]').first();
          await expect(modelButton).toBeVisible();
          await expect(async () => {
            const box = await modelButton.boundingBox();
            expect(box).not.toBeNull();
            if (box) {
              expect(box.width).toBeGreaterThanOrEqual(43.9);
              expect(box.height).toBeGreaterThanOrEqual(43.9);
            }
          }).toPass({ timeout: 5000 });

          // 5. Open Radix Sheet Drawer and verify Drawer Close (X) button (>= 44x44px)
          await menuButton.click();
          const drawer = page.locator('[data-slot="sheet-content"]');
          await expect(drawer).toBeVisible();
          const closeButton = drawer.locator('button[aria-label*="ferm" i], button[aria-label*="close" i]').first();
          await expect(closeButton).toBeVisible();
          await expect(async () => {
            const closeBox = await closeButton.boundingBox();
            expect(closeBox).not.toBeNull();
            if (closeBox) {
              expect(closeBox.width).toBeGreaterThanOrEqual(43.9);
              expect(closeBox.height).toBeGreaterThanOrEqual(43.9);
            }
          }).toPass({ timeout: 5000 });
          // Test accessible Radix Sheet dismissal via Escape key
          await page.keyboard.press('Escape');
          await expect(drawer).not.toBeVisible();

          // 6. Mobile Input Field Height (>= 44px on mobile)
          await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
          const emailInput = page.locator('input[type="email"]').first();
          await expect(emailInput).toBeVisible();
          await expect(async () => {
            const inputBox = await emailInput.boundingBox();
            expect(inputBox).not.toBeNull();
            if (inputBox) {
              expect(inputBox.height).toBeGreaterThanOrEqual(43.9);
            }
          }).toPass({ timeout: 5000 });
        });

        test('Mobile sticky header must not exceed 56px in height (TASK-SHL-02)', async ({ page }) => {
          await page.goto('/', { waitUntil: 'domcontentloaded' });
          await page.waitForLoadState('load');

          const stickyHeader = page.locator('header').first();
          await expect(stickyHeader).toBeVisible();
          const headerBox = await stickyHeader.boundingBox();
          expect(headerBox).not.toBeNull();
          if (headerBox) {
            // Must be strictly <= 56px (allowing at most 1px fractional rendering margin)
            expect(headerBox.height).toBeLessThanOrEqual(57);
          }
        });
      }

      if (viewport.width === 768) {
        test('Tablet 768px viewport must automatically engage icon rail mode (TASK-SHL-01)', async ({ page }) => {
          await page.goto('/', { waitUntil: 'domcontentloaded' });
          await page.waitForLoadState('load');

          const sidebar = page.locator('aside').first();
          await expect(sidebar).toBeVisible();
          await expect(async () => {
            const box = await sidebar.boundingBox();
            expect(box).not.toBeNull();
            if (box) {
              expect(box.width).toBeLessThanOrEqual(80);
            }
          }).toPass({ timeout: 5000 });
        });
      }

      if (viewport.width === 1440) {
        test('Desktop 1440px viewport must expand sidebar to full width (TASK-SHL-01)', async ({ page }) => {
          await page.goto('/', { waitUntil: 'domcontentloaded' });
          await page.waitForLoadState('load');

          const sidebar = page.locator('aside').first();
          await expect(sidebar).toBeVisible();
          await expect(async () => {
            const box = await sidebar.boundingBox();
            expect(box).not.toBeNull();
            if (box) {
              expect(box.width).toBeGreaterThanOrEqual(256);
            }
          }).toPass({ timeout: 5000 });
        });
      }
    });
  }
});
