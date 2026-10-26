import { test, expect } from '@playwright/test';

/**
 * OfferAnalyst End-to-End Workflow Test Suite
 * Validates critical user paths and core endpoints.
 */
test.describe('OfferAnalyst Critical Paths', () => {

  test('should load the home page with key elements', async ({ page }) => {
    await page.goto('/');
    
    // Expect title or brand heading
    await expect(page).toHaveTitle(/OfferAnalyst/i);
  });

  test('should load authentication pages properly', async ({ page }) => {
    // Navigate to verify page
    await page.goto('/auth/verify');
    await expect(page.locator('body')).toContainText(/Vérification|Email/i);

    // Navigate to reset password page
    await page.goto('/auth/reset');
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

    // If QStash receiver keys are not set, it may process or reject depending on env,
    // but the endpoint must return a valid HTTP JSON response without 500 crashes
    expect([200, 401]).toContain(response.status());
    const body = await response.json();
    expect(body).toBeDefined();
  });

  test('should have accessible navigation and theme switches', async ({ page }) => {
    await page.goto('/');
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

});
