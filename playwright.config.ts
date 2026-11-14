import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./testes/ponta-a-ponta",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    locale: "pt-BR",
  },
  projects: [
    {
      name: "desktop-cromo",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
    },
  ],
});
