import { NextResponse } from "next/server";
import { APP_URL, CLIENT_ID, SHOP_ID } from "@/lib/shopify/customer-account/config";
import { clearTokenCookies, getAccessToken } from "@/lib/shopify/customer-account/tokens";

export async function POST() {
  const accessToken = await getAccessToken();

  if (accessToken) {
    // Fire-and-forget: revocation failure is acceptable
    fetch(`https://shopify.com/authentication/${SHOP_ID}/oauth/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        token: accessToken,
        token_type_hint: "access_token",
        client_id: CLIENT_ID,
      }),
    }).catch(() => {});
  }

  await clearTokenCookies();

  return NextResponse.redirect(`${APP_URL}/`);
}
