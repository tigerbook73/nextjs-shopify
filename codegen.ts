import type { CodegenConfig } from "@graphql-codegen/cli";
import { ApiType, shopifyApiTypes } from "@shopify/api-codegen-preset";
import { config as dotenv } from "dotenv";

dotenv({ path: ".env.local" });

const customerAccountApiKey = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_KEY;
const shopifyApiVersion = "2026-04";

if (!customerAccountApiKey) {
  throw new Error("SHOPIFY_CUSTOMER_ACCOUNT_API_KEY is required for Customer Account API codegen");
}

const config: CodegenConfig = {
  overwrite: true,
  ignoreNoDocuments: true,
  generates: {
    // Customer Account API: pull the current Shopify schema and generate TS types.
    ...shopifyApiTypes({
      apiType: ApiType.Customer,
      apiVersion: shopifyApiVersion,
      apiKey: customerAccountApiKey,
      documents: ["./src/lib/shopify/customer-account/**/*.ts"],
      outputDir: "./src/types/generated/customer-account",
    }),
    // Storefront API: pull the current Shopify schema and generate TS types.
    ...shopifyApiTypes({
      apiType: ApiType.Storefront,
      apiVersion: shopifyApiVersion,
      documents: ["./src/**/*.ts", "./src/**/*.tsx", "!./src/lib/shopify/customer-account/**"],
      outputDir: "./src/types/generated/storefront",
    }),
  },
};

export default config;
