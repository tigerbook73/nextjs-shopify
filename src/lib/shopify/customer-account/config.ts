export const SHOP_ID = process.env.SHOPIFY_SHOP_ID!;
export const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, "");
export const REDIRECT_URI = `${APP_URL}/api/auth/callback`;
export const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
export const CUSTOMER_ACCOUNT_GRAPHQL_ENDPOINT = process.env.SHOPIFY_CUSTOMER_ACCOUNT_GRAPHQL_ENDPOINT;
export const CUSTOMER_ACCOUNT_AUTH_BASE_URL =
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_AUTH_BASE_URL ?? "https://shopify.com/authentication";
