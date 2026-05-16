import type { MetadataRoute } from "next";
import { getProductHandles, getCollectionHandles } from "@/lib/shopify/client";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([getProductHandles(), getCollectionHandles()]);

  return [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...products.map((p) => ({
      url: `${baseUrl}/products/${p.handle}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...collections.map((c) => ({
      url: `${baseUrl}/collections/${c.handle}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
