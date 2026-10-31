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
  '/landing',
  '/search-context',
  '/data-source',
  '/saved',
  '/history',
  '/auth/login',
  '/auth/signup',
  '/auth/reset',
  '/auth/verify',
  '/onboarding',
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
      {
        id: 'resp-offer-2',
        title: 'Lead Frontend Architect',
        description: 'Design responsive and fluid web architectures.',
        price: '85 000 €',
        location: 'Lyon (Hybrid)',
        category: 'Tech',
        finalScore: 88,
        rank: 2,
        justification: 'High architectural experience and design systems mastery.',
        webInsights: ['Modern CSS container queries'],
        breakdown: { relevance: 88, quality: 92, trend: 85 },
        url: 'https://example.com/job/2',
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

      test('Compare route with hydrated saved offers should not have horizontal page overflow', async ({ page }) => {
        await page.addInitScript((offers) => {
          window.localStorage.setItem('offeranalyst_saved_offers', JSON.stringify(offers));
        }, mockAnalysisPayload.results.topOffers);

        await page.goto('/compare?ids=resp-offer-1,resp-offer-2', { waitUntil: 'domcontentloaded' });
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

      test('OfferDetailModal opening should render bottom-sheet or modal without page horizontal overflow', async ({ page }) => {
        await page.addInitScript((data) => {
          window.sessionStorage.setItem('restore_search', JSON.stringify(data));
          window.localStorage.setItem('cookie-consent', JSON.stringify({ necessary: true, functional: true, analytics: false, marketing: false }));
        }, mockAnalysisPayload);

        await page.goto('/analysis', { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('load');

        // Click on the offer card to open OfferDetailModal
        const card = page.locator('div[data-slot="card"]:has-text("Senior Fullstack Engineer")').first();
        await expect(card).toBeVisible({ timeout: 5000 });
        await card.scrollIntoViewIfNeeded();
        await card.click({ force: true });
        const modal = page.locator('[data-slot="dialog-content"]');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const maxScrollWidth = Math.max(doc.scrollWidth, body ? body.scrollWidth : 0);
          const clientWidth = doc.clientWidth;
          return maxScrollWidth - clientWidth;
        });

        expect(overflow).toBeLessThanOrEqual(1);

        // Close modal
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
      });

      test('Dense routes (Admin, Settings, API Keys, Analytics, Projects) should not have horizontal overflow', async ({ page, context }) => {
        await context.addCookies([
          {
            name: 'offeranalyst.session_token',
            value: 'mock_test_session_active',
            domain: 'localhost',
            path: '/',
          },
        ]);

        const denseRoutes = [
          '/admin',
          '/dashboard/settings',
          '/dashboard/api-keys',
          '/dashboard/analytics',
          '/projects',
        ];

        for (const route of denseRoutes) {
          await page.goto(route, { waitUntil: 'domcontentloaded' });
          await page.waitForLoadState('load');

          const overflow = await page.evaluate(() => {
            const doc = document.documentElement;
            const body = document.body;
            const maxScrollWidth = Math.max(doc.scrollWidth, body ? body.scrollWidth : 0);
            const clientWidth = doc.clientWidth;
            return maxScrollWidth - clientWidth;
          });

          expect(overflow).toBeLessThanOrEqual(1);
        }
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

        test('Mobile auth forms have inputmode, autocomplete, and enterkeyhint ergonomics (TASK-OVL-01)', async ({ page }) => {
          // 1. Login page ergonomics
          await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
          const email = page.locator('input[type="email"]').first();
          await expect(email).toHaveAttribute('inputmode', 'email');
          await expect(email).toHaveAttribute('autocomplete', 'email');
          await expect(email).toHaveAttribute('enterkeyhint', 'next');

          const password = page.locator('input[type="password"]').first();
          await expect(password).toHaveAttribute('autocomplete', 'current-password');
          await expect(password).toHaveAttribute('enterkeyhint', 'done');

          // 2. Signup page ergonomics
          await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' });
          const signupName = page.locator('input#name').first();
          await expect(signupName).toHaveAttribute('autocomplete', 'name');
          await expect(signupName).toHaveAttribute('enterkeyhint', 'next');

          const signupEmail = page.locator('input[type="email"]').first();
          await expect(signupEmail).toHaveAttribute('inputmode', 'email');
          await expect(signupEmail).toHaveAttribute('autocomplete', 'email');
          await expect(signupEmail).toHaveAttribute('enterkeyhint', 'next');

          const signupPassword = page.locator('input#password').first();
          await expect(signupPassword).toHaveAttribute('autocomplete', 'new-password');
          await expect(signupPassword).toHaveAttribute('enterkeyhint', 'next');

          const signupConfirm = page.locator('input#confirmPassword').first();
          await expect(signupConfirm).toHaveAttribute('autocomplete', 'new-password');
          await expect(signupConfirm).toHaveAttribute('enterkeyhint', 'done');

          // 3. Reset password page ergonomics
          await page.goto('/auth/reset', { waitUntil: 'domcontentloaded' });
          const resetEmail = page.locator('input#email').first();
          await expect(resetEmail).toHaveAttribute('inputmode', 'email');
          await expect(resetEmail).toHaveAttribute('autocomplete', 'email');
          await expect(resetEmail).toHaveAttribute('enterkeyhint', 'send');
        });

        test('AIModelSelector opens as mobile bottom-sheet with grab handle indicator (TASK-OVL-03)', async ({ page }) => {
          await page.addInitScript(() => {
            window.localStorage.setItem('cookie-consent', JSON.stringify({ necessary: true, functional: true, analytics: false, marketing: false }));
          });
          await page.goto('/', { waitUntil: 'domcontentloaded' });
          await page.waitForLoadState('load');

          const modelBtn = page.locator('button[aria-label*="modèle" i], button[aria-label*="model" i]').first();
          await expect(modelBtn).toBeVisible({ timeout: 5000 });
          await modelBtn.click({ force: true });

          const dialog = page.locator('[data-slot="dialog-content"]');
          await expect(dialog).toBeVisible({ timeout: 5000 });
          await expect(dialog).toHaveAttribute('data-variant', 'bottom-sheet');
          const handle = dialog.locator('div[aria-hidden="true"]').first();
          await expect(handle).toBeVisible();

          await page.keyboard.press('Escape');
          await expect(dialog).not.toBeVisible();
        });

        test('CookieConsent renders adaptively and contains valid legal routes (TASK-OVL-03)', async ({ page }) => {
          await page.goto('/help', { waitUntil: 'domcontentloaded' });
          const cookieBanner = page.locator('text=Cookie Preferences');
          if (await cookieBanner.isVisible()) {
            const privacyLink = page.locator('a[href="/privacy"]');
            await expect(privacyLink).toBeVisible();
            const termsLink = page.locator('a[href="/terms"]');
            await expect(termsLink).toBeVisible();
          }
        });
      }

      test('Unified Z-Index tokens scale is strictly respected (TASK-MOT-01)', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('load');

        const zIndexes = await page.evaluate(() => {
          const rootStyle = getComputedStyle(document.documentElement);
          const header = document.querySelector('header');
          const headerZ = header ? getComputedStyle(header).zIndex : null;
          return {
            varHeader: rootStyle.getPropertyValue('--z-header').trim(),
            varDrawer: rootStyle.getPropertyValue('--z-drawer').trim(),
            varDialog: rootStyle.getPropertyValue('--z-dialog').trim(),
            varToast: rootStyle.getPropertyValue('--z-toast').trim(),
            varCookie: rootStyle.getPropertyValue('--z-cookie').trim(),
            headerZ,
          };
        });

        expect(zIndexes.varHeader).toBe('30');
        expect(zIndexes.varDrawer).toBe('50');
        expect(zIndexes.varDialog).toBe('60');
        expect(zIndexes.varToast).toBe('70');
        expect(zIndexes.varCookie).toBe('80');
        expect(zIndexes.headerZ).toBe('30');
      });

      test('Scroll padding and smooth behavior configured properly (TASK-MOT-03)', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('load');

        const scrollProps = await page.evaluate(() => {
          const htmlStyle = getComputedStyle(document.documentElement);
          return {
            scrollBehavior: htmlStyle.scrollBehavior,
            scrollPaddingTop: htmlStyle.scrollPaddingTop,
          };
        });

        expect(scrollProps.scrollBehavior).toBe('smooth');
        expect(parseFloat(scrollProps.scrollPaddingTop)).toBeGreaterThanOrEqual(56);
      });

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
