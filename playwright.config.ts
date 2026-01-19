import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Run tests sequentially for data consistency
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Single worker for database state consistency
  workers: 1,
  reporter: [
    ['html'],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  // Global setup: start docker, generate test data
  globalSetup: require.resolve('./e2e/global-setup'),
  // Global teardown: clean test data
  globalTeardown: require.resolve('./e2e/global-teardown'),
  // Increase timeout for upload operations
  timeout: 120000,
  expect: {
    timeout: 15000,
  },
});
