import type {
  GetCustomerQuery,
  GetOrdersQuery,
  GetOrderDetailQuery,
  GetAddressesQuery,
} from "@/types/generated/customer-account/customer.generated";

export interface CustomerAccountToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export type CustomerEmailAddress = NonNullable<GetCustomerQuery["customer"]["emailAddress"]>;
export type CustomerProfile = GetCustomerQuery["customer"];
export type CustomerAddress = GetAddressesQuery["customer"]["addresses"]["nodes"][number];

type OrderNode = GetOrdersQuery["customer"]["orders"]["nodes"][number];
export type CustomerOrderLineItem = OrderNode["lineItems"]["nodes"][number];
export type CustomerOrder = OrderNode;

export type CustomerOrderDetail = NonNullable<GetOrderDetailQuery["order"]>;
export type CustomerOrderFulfillment = CustomerOrderDetail["fulfillments"]["nodes"][number];
export type CustomerOrderFulfillmentTracking = CustomerOrderFulfillment["trackingInformation"][number];

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
