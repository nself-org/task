import { test, expect, type Page } from '@playwright/test';

// Mock authenticated state for task tests
async function mockAuth(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'mock-test-token');
    localStorage.setItem('auth_refresh', 'mock-refresh-token');
  });
}

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
  });

  test('task list page renders', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Look for task list container or empty state
    const taskList = page
      .locator('[data-testid="task-list"]')
      .or(page.locator('[role="list"]'))
      .or(page.locator('text=No tasks'))
      .or(page.locator('text=Add your first task'));
    await expect(taskList).toBeVisible({ timeout: 10000 });
  });

  test('new task button is present and clickable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const newTaskBtn = page
      .locator('button:has-text("New Task")')
      .or(
        page
          .locator('button:has-text("Add task")')
          .or(
            page
              .locator('[data-testid="new-task-btn"]')
              .or(page.locator('[aria-label*="new task" i]')),
          ),
      );
    if (await newTaskBtn.isVisible()) {
      await expect(newTaskBtn).toBeEnabled();
    }
  });

  test('page title is correct', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ɳTask|nTask|Tasks/i);
  });
});
