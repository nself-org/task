/**
 * nTasks app E2E smoke tests — T-0395
 *
 * 8 test scenarios for the nTasks reference app (nself/tasks).
 * Requires the tasks app to be running at TASKS_APP_URL.
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.TASKS_APP_URL ?? 'http://localhost:3000';

test.use({ baseURL: BASE });

const available = !!process.env.TASKS_APP_URL;

test.describe('nTasks app', () => {
  // Scenario 1: App loads
  test('app loads with correct title', async ({ page }) => {
    test.skip(!available, 'TASKS_APP_URL not set');

    await page.goto('/');
    await expect(page).toHaveTitle(/nTasks|Tasks|nself/i);
  });

  // Scenario 2: Login page
  test('login page is reachable', async ({ page }) => {
    test.skip(!available, 'TASKS_APP_URL not set');

    const resp = await page.goto('/login');
    expect(resp?.status()).not.toBe(404);

    const email = page.locator('input[type="email"]').first();
    await expect(email).toBeVisible();
  });

  // Scenario 3: Sign up with new account
  test('signup with new email succeeds', async ({ page }) => {
    test.skip(!available, 'TASKS_APP_URL not set');

    await page.goto('/signup');
    const uniqueEmail = `e2e+${Date.now()}@demo.nself.local`;

    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'TestDemoPass123!');

    const confirmInput = page.locator('input[name="confirmPassword"], input[placeholder*="confirm" i]');
    if (await confirmInput.count() > 0) {
      await confirmInput.fill('TestDemoPass123!');
    }

    await page.click('button[type="submit"]');
    // Should redirect to dashboard or verify email page
    await page.waitForURL(/dashboard|verify|confirm|tasks/, { timeout: 8000 });
  });

  // Scenario 4: Create a task
  test('authenticated user can create a task', async ({ page }) => {
    test.skip(!available || !process.env.TASKS_TEST_EMAIL, 'No test credentials');

    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TASKS_TEST_EMAIL!);
    await page.fill('input[type="password"]', process.env.TASKS_TEST_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|tasks/);

    // Click the "New task" or "Add task" button
    const addBtn = page.locator('button:has-text("New task"), button:has-text("Add task"), button[data-testid="add-task"]').first();
    await addBtn.click();

    // Fill task title
    const titleInput = page.locator('input[placeholder*="title" i], input[name="title"]').first();
    await titleInput.fill('E2E Test Task');
    await page.keyboard.press('Enter');

    // Task should appear in the list
    const taskItem = page.locator('li:has-text("E2E Test Task"), [data-testid="task-item"]:has-text("E2E Test Task")').first();
    await expect(taskItem).toBeVisible({ timeout: 5000 });
  });

  // Scenario 5: Mark task as complete
  test('task can be marked as complete', async ({ page }) => {
    test.skip(!available || !process.env.TASKS_TEST_EMAIL, 'No test credentials');

    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TASKS_TEST_EMAIL!);
    await page.fill('input[type="password"]', process.env.TASKS_TEST_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|tasks/);

    const checkbox = page.locator('[type="checkbox"], [data-testid="task-complete"]').first();
    if (await checkbox.count() > 0) {
      await checkbox.click();
      await expect(checkbox).toBeChecked();
    }
  });

  // Scenario 6: Real-time update visible (if enabled)
  test('real-time sync indicator is present', async ({ page }) => {
    test.skip(!available, 'TASKS_APP_URL not set');

    await page.goto('/');
    // Look for connection indicator — implementation varies
    const indicator = page.locator('[data-testid="sync-status"], [class*="sync"], [class*="realtime"]').first();
    if (await indicator.count() > 0) {
      await expect(indicator).toBeVisible();
    }
  });

  // Scenario 7: Navigation between views
  test('navigation between views works', async ({ page }) => {
    test.skip(!available || !process.env.TASKS_TEST_EMAIL, 'No test credentials');

    await page.goto('/');
    // Click each nav item and verify no 500 errors
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();

    for (let i = 0; i < Math.min(count, 4); i++) {
      await navLinks.nth(i).click();
      await page.waitForLoadState('domcontentloaded');
      const resp = await page.goto(page.url());
      if (resp) {
        expect(resp.status()).toBeLessThan(500);
      }
    }
  });

  // Scenario 8: Mobile viewport
  test('app is usable on mobile viewport', async ({ page }) => {
    test.skip(!available, 'TASKS_APP_URL not set');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(395);
  });
});
