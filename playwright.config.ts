import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3001);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CUSTOMER_ACCOUNT_MOCK_PORT = Number(process.env.CUSTOMER_ACCOUNT_MOCK_PORT ?? 4001);
const CUSTOMER_ACCOUNT_MOCK_URL = `http://127.0.0.1:${CUSTOMER_ACCOUNT_MOCK_PORT}`;
const mockServerEnv = {
  CUSTOMER_ACCOUNT_MOCK_PORT: String(CUSTOMER_ACCOUNT_MOCK_PORT),
  NEXT_PUBLIC_APP_URL: BASE_URL,
  SHOPIFY_CUSTOMER_ACCOUNT_GRAPHQL_ENDPOINT: `${CUSTOMER_ACCOUNT_MOCK_URL}/graphql`,
  SHOPIFY_CUSTOMER_ACCOUNT_AUTH_BASE_URL: `${CUSTOMER_ACCOUNT_MOCK_URL}/authentication`,
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    ignoreHTTPSErrors: true,
  },
  webServer: [
    {
      command: "node tests/e2e/customer-account-mock-server.mjs",
      env: { CUSTOMER_ACCOUNT_MOCK_PORT: String(CUSTOMER_ACCOUNT_MOCK_PORT) },
      url: `${CUSTOMER_ACCOUNT_MOCK_URL}/health`,
      reuseExistingServer: Boolean(process.env.PLAYWRIGHT_REUSE_SERVER),
      timeout: 30_000,
    },
    {
      command: `pnpm build && pnpm start --hostname 127.0.0.1 --port ${PORT}`,
      env: mockServerEnv,
      url: BASE_URL,
      reuseExistingServer: Boolean(process.env.PLAYWRIGHT_REUSE_SERVER),
      timeout: 180_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
