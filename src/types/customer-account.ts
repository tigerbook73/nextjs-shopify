export interface CustomerAccountToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface CustomerEmailAddress {
  emailAddress: string;
}

export interface CustomerProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  emailAddress: CustomerEmailAddress | null;
  orders?: {
    nodes: { id: string }[];
    pageInfo: { hasNextPage: boolean };
  };
}

export interface CustomerAddress {
  id: string;
  firstName: string | null;
  lastName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  provinceCode: string | null;
  zip: string | null;
  country: string | null;
  countryCode: string | null;
  phone: string | null;
}

export interface CustomerOrderLineItem {
  title: string;
  variantTitle: string | null;
  quantity: number;
  image: { url: string; altText: string | null } | null;
  price: { amount: string; currencyCode: string };
}

export interface CustomerOrderFulfillmentTracking {
  url: string | null;
  number: string | null;
}

export interface CustomerOrderFulfillment {
  status: string;
  updatedAt: string;
  trackingInformation: CustomerOrderFulfillmentTracking[];
}

export interface CustomerOrder {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string;
  totalPrice: { amount: string; currencyCode: string };
  lineItems: { nodes: CustomerOrderLineItem[] };
}

export interface CustomerOrderDetail extends CustomerOrder {
  shippingAddress: CustomerAddress | null;
  fulfillments: { nodes: CustomerOrderFulfillment[] };
  subtotalPrice: { amount: string; currencyCode: string } | null;
  totalShippingPrice: { amount: string; currencyCode: string };
  totalTax: { amount: string; currencyCode: string } | null;
}

export interface AddressInput {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  zoneCode?: string;
  zip?: string;
  territoryCode?: string;
  phoneNumber?: string;
}

export type CustomerActionResult = { success: true } | { success: false; error: string };
