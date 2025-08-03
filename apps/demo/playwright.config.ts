import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ['list'],
    [
      '@simple-pw/reporter',
      {
        projectName: 'demo-app',
        apiUrl: process.env.API_URL || 'http://localhost:3001',
        enabled: true,
      },
    ],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
