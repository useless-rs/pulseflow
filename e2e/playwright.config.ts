import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'blob' : 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run dev --workspace=apps/api',
      url: 'http://localhost:3000/health',
      cwd: '..',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'npm run dev --workspace=apps/web -- --port 5173 --strictPort',
      url: 'http://localhost:5173',
      cwd: '..',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
