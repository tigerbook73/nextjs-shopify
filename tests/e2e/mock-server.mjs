import http from "node:http";

const port = Number(process.env.MOCK_SERVER_PORT ?? 4001);

// ── Storefront: Fixtures ──────────────────────────────────────────────────────

function makeProduct(i) {
  const isShirt = i < 21;
  const title = isShirt ? `Classic Shirt #${i + 1}` : `Accessory #${i - 20}`;
  const handle = isShirt ? `classic-shirt-${i + 1}` : `accessory-${i - 20}`;
  const amount = ((i + 1) * 5 + 14.99).toFixed(2);
  const compareAmount = ((i + 1) * 5 + 24.99).toFixed(2);
  return {
    id: `gid://shopify/Product/${i + 1}`,
    title,
    handle,
    availableForSale: true,
    description: `${title} — quality product.`,
    descriptionHtml: `<p>${title} — quality product.</p>`,
    priceRange: { minVariantPrice: { amount, currencyCode: "USD" } },
    compareAtPriceRange: { minVariantPrice: { amount: compareAmount } },
    featuredImage: { url: "/hero.jpg", altText: title },
    images: { nodes: [{ url: "/hero.jpg", altText: title }] },
    variants: {
      nodes: [
        {
          id: `gid://shopify/ProductVariant/${i + 1}`,
          title: "Default Title",
          availableForSale: true,
          selectedOptions: [{ name: "Title", value: "Default Title" }],
          price: { amount, currencyCode: "USD" },
          compareAtPrice: { amount: compareAmount, currencyCode: "USD" },
        },
      ],
    },
    seo: { title, description: `${title} — quality product.` },
    options: [{ name: "Title", optionValues: [{ name: "Default Title" }] }],
    collections: { nodes: [{ handle: isShirt ? "all-shirts" : "accessories" }] },
  };
}

// Products 0–20: "Classic Shirt #1"–"#21" (21 shirts → search "shirt" returns 21, triggers pagination)
// Products 21–24: "Accessory #1"–"#4"  (4 items → no pagination in accessories collection)
const PRODUCTS = Array.from({ length: 25 }, (_, i) => makeProduct(i));

const COLLECTIONS = [
  {
    id: "gid://shopify/Collection/1",
    title: "All Shirts",
    handle: "all-shirts",
    description: "All our shirts.",
    image: { url: "/hero.jpg", altText: "All Shirts" },
    seo: { title: "All Shirts", description: "Browse all shirts." },
  },
  {
    id: "gid://shopify/Collection/2",
    title: "Accessories",
    handle: "accessories",
    description: "Accessories and more.",
    image: { url: "/hero.jpg", altText: "Accessories" },
    seo: { title: "Accessories", description: "Browse accessories." },
  },
];

// all-shirts: 21 products (> 20 pageSize → triggers pagination)
// accessories: 4 products (< 20 pageSize → no pagination buttons)
const COLLECTION_PRODUCTS = {
  "all-shirts": PRODUCTS.slice(0, 21).map((p) => p.id),
  accessories: PRODUCTS.slice(21).map((p) => p.id),
};

const SHOP = { name: "Mock Shop", description: "A mock store for testing." };

const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.id, p]));
const PRODUCT_HANDLE_MAP = new Map(PRODUCTS.map((p) => [p.handle, p]));
const VARIANT_MAP = new Map(PRODUCTS.flatMap((p) => p.variants.nodes.map((v) => [v.id, { variant: v, product: p }])));

// ── Storefront: Cart state ────────────────────────────────────────────────────

let carts = new Map();
let nextCartId = 1;
let nextLineId = 1;

function buildCartResponse(cart) {
  const subtotal = cart.lines.reduce((sum, line) => sum + parseFloat(line.merchandise.price.amount) * line.quantity, 0);
  const money = (v) => ({ amount: v.toFixed(2), currencyCode: "USD" });
  return {
    id: cart.id,
    checkoutUrl: `https://mock.shop/checkout/${cart.id}`,
    totalQuantity: cart.lines.reduce((s, l) => s + l.quantity, 0),
    lines: { nodes: cart.lines },
    cost: { subtotalAmount: money(subtotal), totalAmount: money(subtotal) },
  };
}

// ── Storefront: Pagination ────────────────────────────────────────────────────

// Cursor encodes the 0-based index of the item it points to.
function encodeCursor(index) {
  return Buffer.from(String(index)).toString("base64");
}

function decodeCursor(cursor) {
  return parseInt(Buffer.from(cursor, "base64").toString("utf8"), 10);
}

function paginate(items, { first, last, after, before }) {
  let startIndex = 0;
  let endIndex = items.length;

  if (after != null) {
    startIndex = decodeCursor(after) + 1;
  }

  if (before != null) {
    endIndex = decodeCursor(before);
    startIndex = Math.max(0, endIndex - (last ?? 20));
  } else if (first != null) {
    endIndex = Math.min(items.length, startIndex + first);
  }

  const slice = items.slice(startIndex, endIndex);
  return {
    nodes: slice,
    pageInfo: {
      hasNextPage: endIndex < items.length,
      hasPreviousPage: startIndex > 0,
      startCursor: slice.length > 0 ? encodeCursor(startIndex) : null,
      endCursor: slice.length > 0 ? encodeCursor(endIndex - 1) : null,
    },
  };
}

// ── Storefront: GraphQL handlers ──────────────────────────────────────────────

function storefrontGraphQL(operationName, variables = {}) {
  switch (operationName) {
    case "GetProducts":
      return { products: paginate(PRODUCTS, variables) };

    case "GetProductByHandle":
      return { product: PRODUCT_HANDLE_MAP.get(variables.handle) ?? null };

    case "GetCollections":
      return { collections: { nodes: COLLECTIONS.slice(0, variables.first ?? 20) } };

    case "GetCollectionHandles":
      return { collections: { nodes: COLLECTIONS.map((c) => ({ handle: c.handle })) } };

    case "GetCollectionByHandle": {
      const col = COLLECTIONS.find((c) => c.handle === variables.handle);
      if (!col) return { collection: null };

      let products = (COLLECTION_PRODUCTS[variables.handle] ?? []).map((id) => PRODUCT_MAP.get(id)).filter(Boolean);

      if (variables.sortKey === "PRICE") {
        products = [...products].sort(
          (a, b) => parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount),
        );
      } else if (variables.sortKey === "TITLE") {
        products = [...products].sort((a, b) => a.title.localeCompare(b.title));
      }

      if (variables.reverse) products = [...products].reverse();

      return { collection: { ...col, products: paginate(products, variables) } };
    }

    case "Search": {
      const q = (variables.query ?? "").toLowerCase();
      const matched = PRODUCTS.filter((p) => p.title.toLowerCase().includes(q));
      const paginated = paginate(matched, variables);
      return {
        search: {
          totalCount: matched.length,
          nodes: paginated.nodes.map((p) => ({ __typename: "Product", ...p })),
          pageInfo: paginated.pageInfo,
        },
      };
    }

    case "GetShop":
      return { shop: SHOP };

    case "GetCart": {
      const cart = carts.get(variables.cartId);
      return { cart: cart ? buildCartResponse(cart) : null };
    }

    case "CartCreate": {
      const id = `gid://shopify/Cart/${nextCartId++}`;
      carts.set(id, { id, lines: [] });
      return { cartCreate: { cart: buildCartResponse(carts.get(id)), userErrors: [] } };
    }

    case "CartLinesAdd": {
      const cart = carts.get(variables.cartId);
      if (!cart) throw new Error("Cart not found");
      for (const line of variables.lines ?? []) {
        const info = VARIANT_MAP.get(line.merchandiseId);
        if (!info) throw new Error(`Variant not found: ${line.merchandiseId}`);
        const existing = cart.lines.find((l) => l.merchandise.id === line.merchandiseId);
        if (existing) {
          existing.quantity += line.quantity;
        } else {
          cart.lines.push({
            id: `gid://shopify/CartLine/${nextLineId++}`,
            quantity: line.quantity,
            merchandise: {
              id: info.variant.id,
              title: info.variant.title,
              selectedOptions: info.variant.selectedOptions,
              price: info.variant.price,
              product: {
                title: info.product.title,
                handle: info.product.handle,
                featuredImage: info.product.featuredImage,
              },
            },
          });
        }
      }
      return { cartLinesAdd: { cart: buildCartResponse(cart), userErrors: [] } };
    }

    case "CartLinesUpdate": {
      const cart = carts.get(variables.cartId);
      if (!cart) throw new Error("Cart not found");
      for (const update of variables.lines ?? []) {
        if (update.quantity === 0) {
          cart.lines = cart.lines.filter((l) => l.id !== update.id);
        } else {
          const line = cart.lines.find((l) => l.id === update.id);
          if (line) line.quantity = update.quantity;
        }
      }
      return { cartLinesUpdate: { cart: buildCartResponse(cart), userErrors: [] } };
    }

    case "CartLinesRemove": {
      const cart = carts.get(variables.cartId);
      if (!cart) throw new Error("Cart not found");
      cart.lines = cart.lines.filter((l) => !(variables.lineIds ?? []).includes(l.id));
      return { cartLinesRemove: { cart: buildCartResponse(cart), userErrors: [] } };
    }

    case "CartBuyerIdentityUpdate":
      return { cartBuyerIdentityUpdate: { cart: { id: variables.cartId }, userErrors: [] } };

    default:
      throw new Error(`Unhandled Storefront operation: ${operationName}`);
  }
}

// ── Customer Account: State ───────────────────────────────────────────────────

const MOCK_ORDER_ID = "gid://shopify/Order/1001";

function initialCustomerState() {
  return {
    customer: {
      id: "gid://shopify/Customer/1",
      firstName: "Ada",
      lastName: "Lovelace",
      displayName: "Ada Lovelace",
      emailAddress: { emailAddress: "ada@example.com" },
      orders: { nodes: [{ id: MOCK_ORDER_ID }], pageInfo: { hasNextPage: false } },
    },
    addresses: [
      {
        id: "gid://shopify/MailingAddress/1",
        firstName: "Ada",
        lastName: "Lovelace",
        address1: "1 Algorithm Lane",
        address2: null,
        city: "London",
        province: "London",
        provinceCode: "LDN",
        zip: "SW1A 1AA",
        country: "United Kingdom",
        countryCode: "GB",
        phone: "+441234567890",
      },
      {
        id: "gid://shopify/MailingAddress/2",
        firstName: "Grace",
        lastName: "Hopper",
        address1: "2 Compiler Road",
        address2: null,
        city: "Arlington",
        province: "Virginia",
        provinceCode: "VA",
        zip: "22201",
        country: "United States",
        countryCode: "US",
        phone: "+12025550123",
      },
    ],
    defaultAddressId: "gid://shopify/MailingAddress/1",
    order: {
      id: MOCK_ORDER_ID,
      name: "#1001",
      processedAt: "2026-05-01T10:00:00Z",
      financialStatus: "PAID",
      fulfillmentStatus: "FULFILLED",
      totalPrice: { amount: "42.00", currencyCode: "USD" },
      subtotalPrice: { amount: "35.00", currencyCode: "USD" },
      totalShippingPrice: { amount: "5.00", currencyCode: "USD" },
      totalTax: { amount: "2.00", currencyCode: "USD" },
      shippingAddress: {
        id: "gid://shopify/MailingAddress/order-shipping",
        firstName: "Ada",
        lastName: "Lovelace",
        address1: "1 Algorithm Lane",
        address2: null,
        city: "London",
        province: "London",
        provinceCode: "LDN",
        zip: "SW1A 1AA",
        country: "United Kingdom",
        countryCode: "GB",
        phone: "+441234567890",
      },
      lineItems: {
        nodes: [
          {
            title: "Test Cotton Tee",
            variantTitle: "Black / M",
            quantity: 2,
            image: { url: "/hero.jpg", altText: "Test Cotton Tee" },
            price: { amount: "17.50", currencyCode: "USD" },
          },
        ],
      },
      fulfillments: {
        nodes: [
          {
            status: "DELIVERED",
            updatedAt: "2026-05-03T10:00:00Z",
            trackingInformation: [{ url: "https://example.com/track/ZX1001", number: "ZX1001" }],
          },
        ],
      },
    },
    nextAddressId: 3,
  };
}

let customerState = initialCustomerState();

function toAddress(input, id) {
  return {
    id,
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
    address1: input.address1 ?? null,
    address2: input.address2 ?? null,
    city: input.city ?? null,
    province: input.zoneCode ?? null,
    provinceCode: input.zoneCode ?? null,
    zip: input.zip ?? null,
    country: input.territoryCode ?? null,
    countryCode: input.territoryCode ?? null,
    phone: input.phoneNumber ?? null,
  };
}

// ── Customer Account: GraphQL handlers ───────────────────────────────────────

function customerAccountGraphQL(operationName, variables = {}) {
  switch (operationName) {
    case "GetCustomer":
      return {
        customer: {
          ...customerState.customer,
          addresses: {
            nodes: customerState.addresses.map((a) => ({ id: a.id })),
            pageInfo: { hasNextPage: false },
          },
        },
      };

    case "GetOrders":
      return {
        customer: { orders: { nodes: [customerState.order], pageInfo: { hasNextPage: false } } },
      };

    case "GetOrderDetail":
      return { order: customerState.order };

    case "GetAddresses":
      return {
        customer: {
          defaultAddress: { id: customerState.defaultAddressId },
          addresses: { nodes: customerState.addresses },
        },
      };

    case "CustomerUpdate": {
      const input = variables.input ?? {};
      customerState.customer.firstName = input.firstName ?? null;
      customerState.customer.lastName = input.lastName ?? null;
      customerState.customer.displayName = [input.firstName, input.lastName].filter(Boolean).join(" ");
      customerState.customer.emailAddress = {
        emailAddress: input.email ?? customerState.customer.emailAddress?.emailAddress ?? "",
      };
      return { customerUpdate: { customer: customerState.customer, userErrors: [] } };
    }

    case "CustomerAddressCreate": {
      const id = `gid://shopify/MailingAddress/${customerState.nextAddressId++}`;
      const address = toAddress(variables.address ?? {}, id);
      customerState.addresses.push(address);
      if (variables.defaultAddress === true) customerState.defaultAddressId = id;
      return { customerAddressCreate: { customerAddress: { id }, userErrors: [] } };
    }

    case "CustomerAddressUpdate": {
      const { addressId } = variables;
      const idx = customerState.addresses.findIndex((a) => a.id === addressId);
      if (variables.defaultAddress === true) customerState.defaultAddressId = addressId;
      if (idx >= 0 && variables.address) {
        customerState.addresses[idx] = toAddress(variables.address, addressId);
      }
      return { customerAddressUpdate: { customerAddress: { id: addressId }, userErrors: [] } };
    }

    case "CustomerAddressSetDefault":
      customerState.defaultAddressId = variables.addressId;
      return {
        customerAddressUpdate: { customerAddress: { id: variables.addressId }, userErrors: [] },
      };

    case "CustomerAddressDelete": {
      const { addressId } = variables;
      customerState.addresses = customerState.addresses.filter((a) => a.id !== addressId);
      return { customerAddressDelete: { deletedAddressId: addressId, userErrors: [] } };
    }

    default:
      throw new Error(`Unhandled Customer Account operation: ${operationName}`);
  }
}

// ── Shared utilities ──────────────────────────────────────────────────────────

function getOperationName(payload) {
  if (payload.operationName) return payload.operationName;
  const match = String(payload.query ?? "").match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)/);
  return match?.[1];
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

// ── HTTP Server ───────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (method === "GET" && url === "/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (method === "POST" && url === "/reset") {
    // Reset only customer account state. Cart state is browser-session-scoped (each test has
    // its own cartId cookie), so resetting it globally would race with parallel cart tests.
    customerState = initialCustomerState();
    sendJson(res, 200, { ok: true });
    return;
  }

  // Customer Account — OAuth
  if (method === "GET" && url?.includes("/oauth/authorize")) {
    const fullUrl = new URL(url, `http://127.0.0.1:${port}`);
    const redirectUri = fullUrl.searchParams.get("redirect_uri");
    const stateParam = fullUrl.searchParams.get("state");
    if (!redirectUri || !stateParam) {
      sendJson(res, 400, { error: "Missing redirect_uri or state" });
      return;
    }
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set("code", "mock-auth-code");
    callbackUrl.searchParams.set("state", stateParam);
    res.writeHead(302, { Location: callbackUrl.toString() });
    res.end();
    return;
  }

  if (method === "POST" && url?.endsWith("/oauth/token")) {
    sendJson(res, 200, {
      access_token: "mock-refreshed-access-token",
      refresh_token: "mock-refresh-token",
      expires_in: 3600,
      token_type: "Bearer",
    });
    return;
  }

  if (method === "POST" && url?.endsWith("/oauth/revoke")) {
    sendJson(res, 200, { ok: true });
    return;
  }

  // Customer Account — GraphQL
  if (method === "POST" && url === "/graphql") {
    try {
      const payload = JSON.parse(await readBody(req));
      sendJson(res, 200, {
        data: customerAccountGraphQL(getOperationName(payload), payload.variables),
      });
    } catch (err) {
      sendJson(res, 500, {
        errors: [{ message: err instanceof Error ? err.message : "Mock error" }],
      });
    }
    return;
  }

  // Storefront — GraphQL
  if (method === "POST" && url === "/storefront") {
    try {
      const payload = JSON.parse(await readBody(req));
      sendJson(res, 200, {
        data: storefrontGraphQL(getOperationName(payload), payload.variables),
      });
    } catch (err) {
      sendJson(res, 500, {
        errors: [{ message: err instanceof Error ? err.message : "Mock error" }],
      });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Mock server listening on http://127.0.0.1:${port}`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
