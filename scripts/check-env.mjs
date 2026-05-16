#!/usr/bin/env node
/**
 * 校验运行项目所需的环境变量是否齐全
 * 用法：pnpm env:check
 */
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../.env.local");

if (!existsSync(envPath)) {
  console.error("❌ 缺少 .env.local 文件，请复制 .env.example 并填写变量");
  process.exit(1);
}

config({ path: envPath });

const required = ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_STOREFRONT_ACCESS_TOKEN"];

const optional = ["NEXT_PUBLIC_SITE_URL"];

const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  console.error("❌ 缺少必填环境变量：");
  missing.forEach((k) => console.error(`   • ${k}`));
  process.exit(1);
}

console.log("✅ 必填环境变量已配置：");
required.forEach((k) => {
  const val = process.env[k];
  const masked = val.length > 8 ? val.slice(0, 4) + "****" + val.slice(-4) : "****";
  console.log(`   • ${k} = ${masked}`);
});

const missingOptional = optional.filter((k) => !process.env[k]);
if (missingOptional.length) {
  console.warn("\n⚠️  可选环境变量未设置（不影响开发）：");
  missingOptional.forEach((k) => console.warn(`   • ${k}`));
}

console.log("\n🎉 环境配置正常，可以运行 pnpm dev");
