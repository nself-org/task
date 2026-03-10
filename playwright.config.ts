import { defineConfig, devices } from '@playwright/test';

/**
 * nself-demo Playwright configuration
 * T-0395
 *
 * Smoke tests run against the demo app at DEMO_URL (default: localhost:3002).
 * The frontend dev server runs on port 3002 inside the demo project.
 *
 * Usage:
 *   DEMO_URL=http://localhost:3002 pnpm test:e2e
 *   DEMO_URL=https://staging.demo.nself.org pnpm test:e2e
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Stop on first failure in CI to surface issues fast
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: process.env.DEMO_URL || 'http://localhost:3002',

    // Capture artifacts on failure
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
