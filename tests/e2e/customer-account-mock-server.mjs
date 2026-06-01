import http from "node:http";

const port = Number(process.env.CUSTOMER_ACCOUNT_MOCK_PORT ?? 4010);

const MOCK_ORDER_ID = "gid://shopify/Order/1001";

function initialState() {
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

let state = initialState();

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

function graphqlResponse(operationName, variables = {}) {
  switch (operationName) {
    case "GetCustomer":
      return { customer: state.customer };

    case "GetOrders":
      return { customer: { orders: { nodes: [state.order], pageInfo: { hasNextPage: false } } } };

    case "GetOrderDetail":
      return { order: state.order };

    case "GetAddresses":
      return {
        customer: {
          defaultAddress: { id: state.defaultAddressId },
          addresses: { nodes: state.addresses },
        },
      };

    case "CustomerUpdate": {
      const input = variables.input ?? {};
      state.customer.firstName = input.firstName ?? null;
      state.customer.lastName = input.lastName ?? null;
      state.customer.displayName = [input.firstName, input.lastName].filter(Boolean).join(" ");
      state.customer.emailAddress = { emailAddress: input.email ?? state.customer.emailAddress?.emailAddress ?? "" };
      return { customerUpdate: { customer: state.customer, userErrors: [] } };
    }

    case "CustomerAddressCreate": {
      const id = `gid://shopify/MailingAddress/${state.nextAddressId++}`;
      const address = toAddress(variables.address ?? {}, id);
      state.addresses.push(address);
      if (variables.defaultAddress === true) state.defaultAddressId = id;
      return { customerAddressCreate: { customerAddress: { id }, userErrors: [] } };
    }

    case "CustomerAddressUpdate": {
      const { addressId } = variables;
      const existingIndex = state.addresses.findIndex((address) => address.id === addressId);
      if (variables.defaultAddress === true) state.defaultAddressId = addressId;
      if (existingIndex >= 0 && variables.address) {
        state.addresses[existingIndex] = toAddress(variables.address, addressId);
      }
      return { customerAddressUpdate: { customerAddress: { id: addressId }, userErrors: [] } };
    }

    case "CustomerAddressSetDefault": {
      state.defaultAddressId = variables.addressId;
      return { customerAddressUpdate: { customerAddress: { id: variables.addressId }, userErrors: [] } };
    }

    case "CustomerAddressDelete": {
      const { addressId } = variables;
      state.addresses = state.addresses.filter((address) => address.id !== addressId);
      return { customerAddressDelete: { deletedAddressId: addressId, userErrors: [] } };
    }

    default:
      throw new Error(`Unhandled Customer Account mock operation: ${operationName}`);
  }
}

function getOperationName(payload) {
  if (payload.operationName) return payload.operationName;

  const match = String(payload.query ?? "").match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)/);
  return match?.[1];
}

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && request.url === "/reset") {
    state = initialState();
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && request.url?.includes("/oauth/authorize")) {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    const redirectUri = url.searchParams.get("redirect_uri");
    const stateParam = url.searchParams.get("state");

    if (!redirectUri || !stateParam) {
      sendJson(response, 400, { error: "Missing redirect_uri or state" });
      return;
    }

    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set("code", "mock-auth-code");
    callbackUrl.searchParams.set("state", stateParam);

    response.writeHead(302, { Location: callbackUrl.toString() });
    response.end();
    return;
  }

  if (request.method === "POST" && request.url?.endsWith("/oauth/token")) {
    sendJson(response, 200, {
      access_token: "mock-refreshed-access-token",
      refresh_token: "mock-refresh-token",
      expires_in: 3600,
      token_type: "Bearer",
    });
    return;
  }

  if (request.method === "POST" && request.url?.endsWith("/oauth/revoke")) {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && request.url === "/graphql") {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        const payload = JSON.parse(body);
        sendJson(response, 200, { data: graphqlResponse(getOperationName(payload), payload.variables) });
      } catch (error) {
        sendJson(response, 500, { errors: [{ message: error instanceof Error ? error.message : "Mock error" }] });
      }
    });
    return;
  }

  sendJson(response, 404, { error: "Not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Customer Account mock server listening on http://127.0.0.1:${port}`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
