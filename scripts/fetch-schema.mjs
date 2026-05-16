#!/usr/bin/env node
/**
 * 从 Shopify Storefront API 拉取 GraphQL schema，保存为 schema.graphql
 * 用法：pnpm schema:fetch
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env.local") });

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!domain || !token) {
  console.error("❌ 缺少环境变量：SHOPIFY_STORE_DOMAIN 或 SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  process.exit(1);
}

const endpoint = `https://${domain}/api/2024-10/graphql.json`;

const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types { ...FullType }
      directives {
        name description locations
        args { ...InputValue }
      }
    }
  }
  fragment FullType on __Type {
    kind name description
    fields(includeDeprecated: true) {
      name description
      args { ...InputValue }
      type { ...TypeRef }
      isDeprecated deprecationReason
    }
    inputFields { ...InputValue }
    interfaces { ...TypeRef }
    enumValues(includeDeprecated: true) { name description isDeprecated deprecationReason }
    possibleTypes { ...TypeRef }
  }
  fragment InputValue on __InputValue {
    name description
    type { ...TypeRef }
    defaultValue
  }
  fragment TypeRef on __Type {
    kind name
    ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name } } } } } }
  }
`;

console.log(`⏳ 正在从 ${domain} 拉取 schema...`);

const res = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": token,
  },
  body: JSON.stringify({ query: introspectionQuery }),
});

if (!res.ok) {
  console.error(`❌ 请求失败：${res.status} ${res.statusText}`);
  process.exit(1);
}

const { data, errors } = await res.json();

if (errors) {
  console.error("❌ GraphQL 错误：", errors[0].message);
  process.exit(1);
}

// 将 introspection 结果转换为 SDL（Schema Definition Language）
const { buildClientSchema, printSchema } = await import("graphql");
const schema = buildClientSchema(data);
const sdl = printSchema(schema);

const outputPath = join(__dirname, "../schema.graphql");
writeFileSync(outputPath, sdl, "utf-8");
console.log(`✅ schema.graphql 已生成（${(sdl.length / 1024).toFixed(0)} KB）`);
