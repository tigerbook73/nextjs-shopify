import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { TAGS } from "@/lib/shopify/cache-tags";

const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET ?? "";

function verifyHmac(body: string, signature: string): boolean {
  const digest = crypto.createHmac("sha256", WEBHOOK_SECRET).update(body, "utf8").digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

const TOPIC_TAG_MAP: Record<string, string[]> = {
  "products/create": [TAGS.products],
  "products/update": [TAGS.products],
  "products/delete": [TAGS.products],
  "collections/create": [TAGS.collections],
  "collections/update": [TAGS.collections],
  "collections/delete": [TAGS.collections],
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const signature = req.headers.get("x-shopify-hmac-sha256") ?? "";
  const topic = req.headers.get("x-shopify-topic") ?? "";
  const body = await req.text();

  if (!WEBHOOK_SECRET || !verifyHmac(body, signature)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tags = TOPIC_TAG_MAP[topic];
  if (tags) {
    tags.forEach((tag) => revalidateTag(tag, {}));
  }

  return NextResponse.json({ revalidated: true, topic, timestamp: Date.now() });
}
