import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3001);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const MOCK_SERVER_PORT = Number(process.env.MOCK_SERVER_PORT ?? 4001);
const MOCK_SERVER_URL = `http://127.0.0.1:${MOCK_SERVER_PORT}`;
const mockServerEnv = {
  MOCK_SERVER_PORT: String(MOCK_SERVER_PORT),
  NEXT_PUBLIC_APP_URL: BASE_URL,
  SHOPIFY_CUSTOMER_ACCOUNT_GRAPHQL_ENDPOINT: `${MOCK_SERVER_URL}/graphql`,
  SHOPIFY_CUSTOMER_ACCOUNT_AUTH_BASE_URL: `${MOCK_SERVER_URL}/authentication`,
  SHOPIFY_STOREFRONT_GRAPHQL_ENDPOINT: `${MOCK_SERVER_URL}/storefront`,
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
      command: "node tests/e2e/mock-server.mjs",
      env: { MOCK_SERVER_PORT: String(MOCK_SERVER_PORT) },
      url: `${MOCK_SERVER_URL}/health`,
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
