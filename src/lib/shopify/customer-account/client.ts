import { APP_URL, SHOPIFY_STORE_DOMAIN } from "./config";

let endpointPromise: Promise<string> | null = null;

async function getCustomerAccountEndpoint(): Promise<string> {
  endpointPromise ??= fetch(`https://${SHOPIFY_STORE_DOMAIN}/.well-known/customer-account-api`, {
    cache: "force-cache",
  })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Customer Account API discovery failed: ${res.status} ${res.statusText}`);
      }

      const data = (await res.json()) as { graphql_api?: string };
      if (!data.graphql_api) {
        throw new Error("Customer Account API discovery did not return graphql_api");
      }

      return data.graphql_api;
    })
    .catch((err) => {
      endpointPromise = null;
      throw err;
    });

  return endpointPromise;
}

export async function customerAccountFetch<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const endpoint = await getCustomerAccountEndpoint();
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
      Origin: APP_URL,
      "User-Agent": "nextjs-shopify-customer-account",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[CA API] ${res.status} ${res.statusText}`, body.slice(0, 500));
    throw new Error(`Customer Account API error: ${res.status} ${res.statusText}`);
  }

  const body = await res.text();
  let json: { data?: T; errors?: { message: string }[] };
  try {
    json = JSON.parse(body) as { data?: T; errors?: { message: string }[] };
  } catch {
    console.error("[CA API] Non-JSON response", {
      endpoint,
      contentType: res.headers.get("content-type"),
      body: body.slice(0, 500),
    });
    throw new Error("Customer Account API returned non-JSON response");
  }

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }

  if (json.data == null) {
    throw new Error("Customer Account API returned no data");
  }

  return json.data as T;
}
