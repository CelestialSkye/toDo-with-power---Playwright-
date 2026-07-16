import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'https://list-locker.net',
    // Reuse the single anonymous Firebase session created in global-setup —
    // one sign-up per run instead of one per test (see global-setup.ts).
    storageState: 'playwright/.auth/user.json',
    trace: 'on-first-retry',
    actionTimeout: 15_000,
  },

  expect: {
    timeout: 15_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
