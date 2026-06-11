import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify/storefront/client";
import { GET_SHOP_QUERY } from "@/lib/shopify/storefront/queries";

export async function GET() {
  try {
    await shopifyFetch({ query: GET_SHOP_QUERY, cache: "no-store" });
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ status: "error", error: message }, { status: 503 });
  }
}
