import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { sanitizeTelemetryError } from '../../src/app/actions/shared/api-key-provider';

const prisma = new PrismaClient();

/**
 * OfferAnalyst End-to-End Workflow & Observability Test Suite
 * Sprint 16 (TASK-E2E-01 & TASK-OBS-02)
 *
 * Covers:
 * 1. Critical routes (Home, Auth, Jobs API)
 * 2. Search context & data source workflow navigation
 * 3. Complete analysis results, scoring chart, detail modal & PDF/CSV exports (TASK-E2E-01.01)
 * 4. Public share page (/share/[id]) read-only verification & anti-mutation (TASK-E2E-01.02)
 * 5. Web Vitals telemetry endpoint (TASK-OBS-02.02)
 * 6. Secret sanitization and FinOps telemetry safety (TASK-OBS-02.01)
 */
test.describe('OfferAnalyst Critical Paths & Observability', () => {
  test.afterAll(async () => {
    await prisma.$disconnect().catch(() => {});
  });

  // --------------------------------------------------------------------------
  // SUITE 1: Critical Public & Auth Routes
  // --------------------------------------------------------------------------
  test('should load the home page with key elements and navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Offer\s?Analyst/i);
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // CTA to start search
    const startLink = page.locator('a[href="/search-context"]').first();
    await expect(startLink).toBeVisible();
  });

  test('should load authentication pages properly without error', async ({ page }) => {
    await page.goto('/auth/verify', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(/Vérification|Email/i);

    await page.goto('/auth/reset', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(/Réinitialisation|Mot de passe/i);
  });

  test('should reject unsigned requests on the QStash background job worker', async ({ request }) => {
    const response = await request.post('/api/jobs', {
      data: {
        id: 'test-unauthorized-job',
        type: 'send_email',
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Missing signature header');
  });

  // --------------------------------------------------------------------------
  // SUITE 2: Search Context & Data Source Configuration Journey
  // --------------------------------------------------------------------------
  test('should allow configuring search context with presets and proceed to data source', async ({ page }) => {
    await page.goto('/search-context', { waitUntil: 'domcontentloaded' });

    // Verify search context form elements
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Contexte|Recherche|Search/i }).first()).toBeVisible();

    // Click on a preset button if present
    const presetButton = page.locator('button').filter({ hasText: /Tech Lead|DevOps|Immobilier|Freelance/i }).first();
    if (await presetButton.isVisible()) {
      await presetButton.click();
    }

    // Verify continue button navigates to data-source
    const continueLink = page.locator('a[href="/data-source"]').first();
    await expect(continueLink).toBeVisible();
    await continueLink.click();

    await expect(page).toHaveURL(/\/data-source/);
    await expect(page.locator('body')).toContainText(/Source|Données|Data/i);
  });

  // --------------------------------------------------------------------------
  // SUITE 3: Analysis Results, Scoring Chart, Detail Modal & Exports (TASK-E2E-01.01)
  // --------------------------------------------------------------------------
  test('should display analysis results, open detail modal, and support exports', async ({ page }) => {
    // Seed analysis results into sessionStorage to test client state hydration deterministically
    const mockAnalysisPayload = {
      inputs: {
        domain: 'Tech Lead Cloud & DevOps',
        criteria: 'Kubernetes, Go, Remote',
        context: 'Culture scale-up, haute disponibilité',
      },
      results: {
        topOffers: [
          {
            id: 'e2e-offer-alpha',
            title: 'Lead Cloud Architect GCP/K8s',
            description: 'Conception de l’infrastructure multi-région pour 5M d’utilisateurs. Stack Go, Terraform et Kubernetes managé.',
            price: '95 000 €',
            location: 'Paris (Full Remote)',
            category: 'Tech / Cloud',
            finalScore: 94,
            rank: 1,
            justification: 'Excellente adéquation avec les critères techniques, forte autonomie et niveau de rémunération supérieur au marché.',
            webInsights: ['Marché Cloud très tendu', 'Budget validé en CDI'],
            breakdown: { relevance: 96, quality: 92, trend: 94 },
            url: 'https://example.com/jobs/cloud-1'
          },
          {
            id: 'e2e-offer-beta',
            title: 'Staff Site Reliability Engineer (SRE)',
            description: 'Pilotage de la fiabilité, observabilité OpenTelemetry, SLO/SLA et automatisation des post-mortems.',
            price: '88 000 €',
            location: 'Remote',
            category: 'SRE / Platform',
            finalScore: 89,
            rank: 2,
            justification: 'Solide alignement avec les exigences de haute disponibilité et d’observabilité.',
            webInsights: ['Télétravail complet', 'Équipe internationale'],
            breakdown: { relevance: 90, quality: 88, trend: 89 },
            url: 'https://example.com/jobs/sre-2'
          }
        ],
        marketSummary: 'Le marché de l’architecture cloud et du SRE affiche une demande record avec des rémunérations attractives.',
        totalAnalyzed: 15
      }
    };

    await page.addInitScript((data) => {
      window.sessionStorage.setItem('restore_search', JSON.stringify(data));
    }, mockAnalysisPayload);

    await page.goto('/analysis', { waitUntil: 'domcontentloaded' });

    // Verify Results Section is hydrated
    await expect(page.locator('body')).toContainText(/Résultats de l'Analyse|Analysis Results/i);
    await expect(page.locator('text=Lead Cloud Architect GCP/K8s')).toBeVisible();
    await expect(page.locator('text=Staff Site Reliability Engineer (SRE)')).toBeVisible();

    // Verify Score badges and breakdowns
    await expect(page.locator('text=94/100')).toBeVisible();
    await expect(page.locator('text=89/100')).toBeVisible();

    // Verify Market summary
    await expect(page.locator('text=Le marché de l’architecture cloud et du SRE')).toBeVisible();

    // Verify Detail Modal Opening (TASK-E2E-01.01)
    const detailButton = page.locator('button').filter({ hasText: /Voir les détails|View Details/i }).first();
    await expect(detailButton).toBeVisible();
    await detailButton.click();

    // Verify Modal content
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Lead Cloud Architect GCP/K8s');
    await expect(modal).toContainText('Conception de l’infrastructure multi-région');
    await expect(modal).toContainText('94'); // Score in modal

    // Close Modal via Escape or close button
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Verify Export PDF & CSV buttons are present and interactive (TASK-E2E-01.01)
    const pdfExportBtn = page.locator('button').filter({ hasText: /PDF/i }).first();
    await expect(pdfExportBtn).toBeVisible();
    await expect(pdfExportBtn).toBeEnabled();

    const csvExportBtn = page.locator('button').filter({ hasText: /CSV/i }).first();
    await expect(csvExportBtn).toBeVisible();
    await expect(csvExportBtn).toBeEnabled();

    // Verify Share Modal button opens sharing dialog
    const shareBtn = page.locator('button').filter({ hasText: /Partager|Share/i }).first();
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    const shareDialog = page.locator('[role="dialog"]');
    await expect(shareDialog).toBeVisible();
    await expect(shareDialog).toContainText(/Partager|Share Summary/i);

    // Close share dialog
    await page.keyboard.press('Escape');
  });

  // --------------------------------------------------------------------------
  // SUITE 4: Public Share Page (/share/[id]) Read-Only & Anti-Mutation (TASK-E2E-01.02)
  // --------------------------------------------------------------------------
  test('should handle non-existent public share links gracefully with 404 card', async ({ page }) => {
    await page.goto('/share/non-existent-share-token-404', { waitUntil: 'domcontentloaded' });

    // Expect fallback card
    await expect(page.locator('body')).toContainText(/Synthèse introuvable ou expirée|Summary Not Found or Expired/i);
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });

  test('should display public shared analysis in strict read-only mode without mutation capabilities', async ({ page }) => {
    const testShareToken = `sh_e2e_test_${Date.now()}`;
    const testDomain = 'Data Engineering & Machine Learning';

    // Seed shared analysis record in MongoDB
    const createdShare = await prisma.sharedAnalysis.create({
      data: {
        shareToken: testShareToken,
        domain: testDomain,
        criteria: 'Python, Apache Spark, Cloud Data Platform',
        model: 'openai/gpt-4o',
        marketSummary: 'Forte demande pour les profils Data Engineers capables d’industrialiser des pipelines IA.',
        topOffers: JSON.stringify([
          {
            id: 'share-offer-1',
            title: 'Lead Data Engineer MLOps',
            description: 'Mise en place de la plateforme de données temps réel et orchestration de feature stores.',
            price: '85 000 €',
            location: 'Lyon (Hybride)',
            category: 'Data / MLOps',
            finalScore: 92,
            rank: 1,
            justification: 'Maîtrise approfondie des flux temps réel et alignement direct avec les besoins exprimés.',
            webInsights: ['Secteur Santé', 'Forte croissance'],
            breakdown: { relevance: 94, quality: 90, trend: 92 },
            url: 'https://example.com/share-data-1'
          }
        ]),
        searchSources: JSON.stringify([
          { title: 'Tech Trends 2026', uri: 'https://example.com/trends-2026' }
        ]),
        totalAnalyzed: 10,
        views: 0,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days TTL
      }
    });

    try {
      await page.goto(`/share/${testShareToken}`, { waitUntil: 'domcontentloaded' });

      // 1. Verify read-only badges and header
      await expect(page.locator('body')).toContainText(/Consultation publique en lecture seule|Public read-only consultation/i);
      await expect(page.locator('body')).toContainText(testDomain);
      await expect(page.locator('text=Lead Data Engineer MLOps')).toBeVisible();
      await expect(page.locator('text=92/100')).toBeVisible();

      // 2. Strict read-only guarantee: NO editable forms or mutation triggers
      const inputElements = page.locator('input[type="text"], textarea, select');
      await expect(inputElements).toHaveCount(0);

      // Verify no "Save offer", "Delete offer", or "Edit" buttons exist on shared view
      const saveOfferBtn = page.locator('button').filter({ hasText: /Sauvegarder l'offre|Save this offer/i });
      await expect(saveOfferBtn).toHaveCount(0);

      // 3. Verify public toolbar actions (PDF/CSV export, Copy link)
      const pdfBtn = page.locator('a[href*="format=pdf"], button:has-text("PDF")').first();
      await expect(pdfBtn).toBeVisible();

      const csvBtn = page.locator('a[href*="format=csv"], button:has-text("CSV")').first();
      await expect(csvBtn).toBeVisible();

      const copyBtn = page.locator('button').filter({ hasText: /Copier le lien|Copy link|Share|Partager/i }).first();
      await expect(copyBtn).toBeVisible();

      // 4. Verify call to action leads back to /
      const ctaBtn = page.locator('a[href="/"]').first();
      await expect(ctaBtn).toBeVisible();

    } finally {
      // Clean up test fixture
      await prisma.sharedAnalysis.deleteMany({
        where: { id: createdShare.id }
      }).catch(() => {});
    }
  });

  // --------------------------------------------------------------------------
  // SUITE 5: Web Vitals Observability API (TASK-OBS-02.02)
  // --------------------------------------------------------------------------
  test('should accept and record Core Web Vitals metrics via non-blocking API', async ({ request }) => {
    // Test valid INP metric
    const resInp = await request.post('/api/analytics/web-vitals', {
      data: {
        name: 'INP',
        value: 45,
        rating: 'good',
        path: '/analysis'
      },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(resInp.status()).toBe(200);
    const bodyInp = await resInp.json();
    expect(bodyInp.success).toBe(true);
    expect(bodyInp.metric).toBe('INP');

    // Test valid FCP metric
    const resFcp = await request.post('/api/analytics/web-vitals', {
      data: {
        name: 'FCP',
        value: 320,
        rating: 'good',
        path: '/'
      },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(resFcp.status()).toBe(200);
    expect((await resFcp.json()).success).toBe(true);

    // Test sendBeacon stringified text payload (text/plain)
    const resBeacon = await request.post('/api/analytics/web-vitals', {
      data: JSON.stringify({
        name: 'CLS',
        value: 0.04,
        rating: 'good',
        path: '/analysis'
      }),
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
    });
    expect(resBeacon.status()).toBe(200);
    const bodyBeacon = await resBeacon.json();
    expect(bodyBeacon.success).toBe(true);
    expect(bodyBeacon.metric).toBe('CLS');

    // Test rejection of negative or invalid values
    const resNegative = await request.post('/api/analytics/web-vitals', {
      data: {
        name: 'LCP',
        value: -50,
        rating: 'good',
      },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(resNegative.status()).toBe(400);

    // Test rejection of invalid metric name
    const resInvalidMetric = await request.post('/api/analytics/web-vitals', {
      data: {
        name: 'INVALID_METRIC_XYZ',
        value: 100,
        rating: 'good',
      },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(resInvalidMetric.status()).toBe(400);

    // Test rejection of missing required fields
    const resMissing = await request.post('/api/analytics/web-vitals', {
      data: {
        name: 'LCP'
        // missing value and rating
      },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(resMissing.status()).toBe(400);
  });

  // --------------------------------------------------------------------------
  // SUITE 6: Secret Leak Prevention & AI Telemetry Redaction (TASK-OBS-02.01)
  // --------------------------------------------------------------------------
  test('should sanitize all AI credentials and prevent secret leaks in telemetry logs', () => {
    const rawError = 'OpenRouter Error 401: Unauthorized with key sk-or-v1-abcdef1234567890abcdef1234567890 and Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const sanitized = sanitizeTelemetryError(rawError);

    expect(sanitized).not.toContain('sk-or-v1-abcdef1234567890abcdef1234567890');
    expect(sanitized).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    expect(sanitized).toContain('sk-or-v1-[REDACTED]');
    expect(sanitized).toContain('Bearer [REDACTED_TOKEN]');

    // Test label replacement without literal $1 bug
    const labelError = 'Failed to connect: api_key: my-secret-value-123456 and secret: confidential_pass_789';
    const sanitizedLabel = sanitizeTelemetryError(labelError);
    expect(sanitizedLabel).not.toContain('$1');
    expect(sanitizedLabel).not.toContain('my-secret-value-123456');
    expect(sanitizedLabel).not.toContain('confidential_pass_789');
    expect(sanitizedLabel).toContain('api_key: "[REDACTED]"');
    expect(sanitizedLabel).toContain('secret: "[REDACTED]"');

    // Test Anthropic and HuggingFace tokens
    const hfError = 'Model error with sk-ant-api03-abcdef1234567890abcdef and token hf_0123456789012345678901234567890123';
    const sanitizedHf = sanitizeTelemetryError(hfError);
    expect(sanitizedHf).toContain('sk-ant-[REDACTED]');
    expect(sanitizedHf).toContain('hf_[REDACTED]');

    // Test with specific caller key
    const customKey = 'custom-secret-key-xyz123';
    const messageWithCustom = `Failed request with key ${customKey}`;
    const sanitizedCustom = sanitizeTelemetryError(messageWithCustom, customKey);
    expect(sanitizedCustom).not.toContain(customKey);
    expect(sanitizedCustom).toContain('[REDACTED_API_KEY]');
  });

});
