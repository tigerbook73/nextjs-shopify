export const SHOP_ID = process.env.SHOPIFY_SHOP_ID!;
export const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, "");
export const REDIRECT_URI = `${APP_URL}/api/auth/callback`;
