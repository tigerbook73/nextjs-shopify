/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as CustomerTypes from "./customer.types.js";

export type CustomerUpdateMutationVariables = CustomerTypes.Exact<{
  input: CustomerTypes.CustomerUpdateInput;
}>;

export type CustomerUpdateMutation = {
  customerUpdate?: CustomerTypes.Maybe<{
    customer?: CustomerTypes.Maybe<
      Pick<CustomerTypes.Customer, "firstName" | "lastName"> & {
        emailAddress?: CustomerTypes.Maybe<Pick<CustomerTypes.CustomerEmailAddress, "emailAddress">>;
      }
    >;
    userErrors: Array<Pick<CustomerTypes.UserErrorsCustomerUserErrors, "field" | "message" | "code">>;
  }>;
};

export type CustomerAddressCreateMutationVariables = CustomerTypes.Exact<{
  address: CustomerTypes.CustomerAddressInput;
  defaultAddress?: CustomerTypes.InputMaybe<CustomerTypes.Scalars["Boolean"]["input"]>;
}>;

export type CustomerAddressCreateMutation = {
  customerAddressCreate?: CustomerTypes.Maybe<{
    customerAddress?: CustomerTypes.Maybe<Pick<CustomerTypes.CustomerAddress, "id">>;
    userErrors: Array<Pick<CustomerTypes.UserErrorsCustomerAddressUserErrors, "field" | "message" | "code">>;
  }>;
};

export type CustomerAddressUpdateMutationVariables = CustomerTypes.Exact<{
  addressId: CustomerTypes.Scalars["ID"]["input"];
  address: CustomerTypes.CustomerAddressInput;
  defaultAddress?: CustomerTypes.InputMaybe<CustomerTypes.Scalars["Boolean"]["input"]>;
}>;

export type CustomerAddressUpdateMutation = {
  customerAddressUpdate?: CustomerTypes.Maybe<{
    customerAddress?: CustomerTypes.Maybe<Pick<CustomerTypes.CustomerAddress, "id">>;
    userErrors: Array<Pick<CustomerTypes.UserErrorsCustomerAddressUserErrors, "field" | "message" | "code">>;
  }>;
};

export type CustomerAddressDeleteMutationVariables = CustomerTypes.Exact<{
  addressId: CustomerTypes.Scalars["ID"]["input"];
}>;

export type CustomerAddressDeleteMutation = {
  customerAddressDelete?: CustomerTypes.Maybe<
    Pick<CustomerTypes.CustomerAddressDeletePayload, "deletedAddressId"> & {
      userErrors: Array<Pick<CustomerTypes.UserErrorsCustomerAddressUserErrors, "field" | "message" | "code">>;
    }
  >;
};

export type CustomerAddressSetDefaultMutationVariables = CustomerTypes.Exact<{
  addressId: CustomerTypes.Scalars["ID"]["input"];
}>;

export type CustomerAddressSetDefaultMutation = {
  customerAddressUpdate?: CustomerTypes.Maybe<{
    customerAddress?: CustomerTypes.Maybe<Pick<CustomerTypes.CustomerAddress, "id">>;
    userErrors: Array<Pick<CustomerTypes.UserErrorsCustomerAddressUserErrors, "field" | "message" | "code">>;
  }>;
};

export type GetCustomerQueryVariables = CustomerTypes.Exact<{ [key: string]: never }>;

export type GetCustomerQuery = {
  customer: Pick<CustomerTypes.Customer, "id" | "firstName" | "lastName" | "displayName"> & {
    emailAddress?: CustomerTypes.Maybe<Pick<CustomerTypes.CustomerEmailAddress, "emailAddress">>;
    orders: { nodes: Array<Pick<CustomerTypes.Order, "id">>; pageInfo: Pick<CustomerTypes.PageInfo, "hasNextPage"> };
  };
};

export type GetOrdersQueryVariables = CustomerTypes.Exact<{
  first: CustomerTypes.Scalars["Int"]["input"];
  after?: CustomerTypes.InputMaybe<CustomerTypes.Scalars["String"]["input"]>;
}>;

export type GetOrdersQuery = {
  customer: {
    orders: {
      nodes: Array<
        Pick<CustomerTypes.Order, "id" | "name" | "processedAt" | "financialStatus" | "fulfillmentStatus"> & {
          totalPrice: Pick<CustomerTypes.MoneyV2, "amount" | "currencyCode">;
          lineItems: {
            nodes: Array<
              Pick<CustomerTypes.LineItem, "title" | "variantTitle" | "quantity"> & {
                image?: CustomerTypes.Maybe<Pick<CustomerTypes.Image, "url" | "altText">>;
                price?: CustomerTypes.Maybe<Pick<CustomerTypes.MoneyV2, "amount" | "currencyCode">>;
              }
            >;
          };
        }
      >;
      pageInfo: Pick<CustomerTypes.PageInfo, "hasNextPage" | "hasPreviousPage" | "startCursor" | "endCursor">;
    };
  };
};

export type GetOrderDetailQueryVariables = CustomerTypes.Exact<{
  orderId: CustomerTypes.Scalars["ID"]["input"];
}>;

export type GetOrderDetailQuery = {
  order?: CustomerTypes.Maybe<
    Pick<CustomerTypes.Order, "id" | "name" | "processedAt" | "financialStatus" | "fulfillmentStatus"> & {
      totalPrice: Pick<CustomerTypes.MoneyV2, "amount" | "currencyCode">;
      subtotalPrice?: CustomerTypes.Maybe<Pick<CustomerTypes.MoneyV2, "amount" | "currencyCode">>;
      totalShippingPrice: Pick<CustomerTypes.MoneyV2, "amount" | "currencyCode">;
      totalTax?: CustomerTypes.Maybe<Pick<CustomerTypes.MoneyV2, "amount" | "currencyCode">>;
      shippingAddress?: CustomerTypes.Maybe<
        Pick<
          CustomerTypes.CustomerAddress,
          "firstName" | "lastName" | "address1" | "address2" | "city" | "province" | "zip" | "country"
        > & { phone: CustomerTypes.CustomerAddress["phoneNumber"] }
      >;
      lineItems: {
        nodes: Array<
          Pick<CustomerTypes.LineItem, "title" | "variantTitle" | "quantity"> & {
            image?: CustomerTypes.Maybe<Pick<CustomerTypes.Image, "url" | "altText">>;
            price?: CustomerTypes.Maybe<Pick<CustomerTypes.MoneyV2, "amount" | "currencyCode">>;
          }
        >;
      };
      fulfillments: {
        nodes: Array<
          Pick<CustomerTypes.Fulfillment, "status" | "updatedAt"> & {
            trackingInformation: Array<Pick<CustomerTypes.TrackingInformation, "url" | "number">>;
          }
        >;
      };
    }
  >;
};

export type GetAddressesQueryVariables = CustomerTypes.Exact<{
  first: CustomerTypes.Scalars["Int"]["input"];
}>;

export type GetAddressesQuery = {
  customer: {
    defaultAddress?: CustomerTypes.Maybe<Pick<CustomerTypes.CustomerAddress, "id">>;
    addresses: {
      nodes: Array<
        Pick<
          CustomerTypes.CustomerAddress,
          "id" | "firstName" | "lastName" | "address1" | "address2" | "city" | "province" | "zip" | "country"
        > & {
          provinceCode: CustomerTypes.CustomerAddress["zoneCode"];
          countryCode: CustomerTypes.CustomerAddress["territoryCode"];
          phone: CustomerTypes.CustomerAddress["phoneNumber"];
        }
      >;
    };
  };
};

interface GeneratedQueryTypes {
  "\n  query GetCustomer {\n    customer {\n      id\n      firstName\n      lastName\n      displayName\n      emailAddress {\n        emailAddress\n      }\n      orders(first: 100) {\n        nodes {\n          id\n        }\n        pageInfo {\n          hasNextPage\n        }\n      }\n    }\n  }\n": {
    return: GetCustomerQuery;
    variables: GetCustomerQueryVariables;
  };
  "\n  query GetOrders($first: Int!, $after: String) {\n    customer {\n      orders(first: $first, after: $after) {\n        nodes {\n          id\n          name\n          processedAt\n          financialStatus\n          fulfillmentStatus\n          totalPrice {\n            amount\n            currencyCode\n          }\n          lineItems(first: 5) {\n            nodes {\n              title\n              variantTitle\n              quantity\n              image {\n                url\n                altText\n              }\n              price {\n                amount\n                currencyCode\n              }\n            }\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n": {
    return: GetOrdersQuery;
    variables: GetOrdersQueryVariables;
  };
  "\n  query GetOrderDetail($orderId: ID!) {\n    order(id: $orderId) {\n      id\n      name\n      processedAt\n      financialStatus\n      fulfillmentStatus\n      totalPrice {\n        amount\n        currencyCode\n      }\n      subtotalPrice: subtotal {\n        amount\n        currencyCode\n      }\n      totalShippingPrice: totalShipping {\n        amount\n        currencyCode\n      }\n      totalTax {\n        amount\n        currencyCode\n      }\n      shippingAddress {\n        firstName\n        lastName\n        address1\n        address2\n        city\n        province\n        zip\n        country\n        phone: phoneNumber\n      }\n      lineItems(first: 50) {\n        nodes {\n          title\n          variantTitle\n          quantity\n          image {\n            url\n            altText\n          }\n          price {\n            amount\n            currencyCode\n          }\n        }\n      }\n      fulfillments(first: 5) {\n        nodes {\n          status\n          updatedAt\n          trackingInformation {\n            url\n            number\n          }\n        }\n      }\n    }\n  }\n": {
    return: GetOrderDetailQuery;
    variables: GetOrderDetailQueryVariables;
  };
  "\n  query GetAddresses($first: Int!) {\n    customer {\n      defaultAddress {\n        id\n      }\n      addresses(first: $first) {\n        nodes {\n          id\n          firstName\n          lastName\n          address1\n          address2\n          city\n          province\n          provinceCode: zoneCode\n          zip\n          country\n          countryCode: territoryCode\n          phone: phoneNumber\n        }\n      }\n    }\n  }\n": {
    return: GetAddressesQuery;
    variables: GetAddressesQueryVariables;
  };
}

interface GeneratedMutationTypes {
  "\n  mutation CustomerUpdate($input: CustomerUpdateInput!) {\n    customerUpdate(input: $input) {\n      customer {\n        firstName\n        lastName\n        emailAddress {\n          emailAddress\n        }\n      }\n      userErrors {\n        field\n        message\n        code\n      }\n    }\n  }\n": {
    return: CustomerUpdateMutation;
    variables: CustomerUpdateMutationVariables;
  };
  "\n  mutation CustomerAddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {\n    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {\n      customerAddress {\n        id\n      }\n      userErrors {\n        field\n        message\n        code\n      }\n    }\n  }\n": {
    return: CustomerAddressCreateMutation;
    variables: CustomerAddressCreateMutationVariables;
  };
  "\n  mutation CustomerAddressUpdate($addressId: ID!, $address: CustomerAddressInput!, $defaultAddress: Boolean) {\n    customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) {\n      customerAddress {\n        id\n      }\n      userErrors {\n        field\n        message\n        code\n      }\n    }\n  }\n": {
    return: CustomerAddressUpdateMutation;
    variables: CustomerAddressUpdateMutationVariables;
  };
  "\n  mutation CustomerAddressDelete($addressId: ID!) {\n    customerAddressDelete(addressId: $addressId) {\n      deletedAddressId\n      userErrors {\n        field\n        message\n        code\n      }\n    }\n  }\n": {
    return: CustomerAddressDeleteMutation;
    variables: CustomerAddressDeleteMutationVariables;
  };
  "\n  mutation CustomerAddressSetDefault($addressId: ID!) {\n    customerAddressUpdate(addressId: $addressId, address: {}, defaultAddress: true) {\n      customerAddress {\n        id\n      }\n      userErrors {\n        field\n        message\n        code\n      }\n    }\n  }\n": {
    return: CustomerAddressSetDefaultMutation;
    variables: CustomerAddressSetDefaultMutationVariables;
  };
}
declare module "@shopify/customer-api-client" {
  type InputMaybe<T> = CustomerTypes.InputMaybe<T>;
  interface CustomerQueries extends GeneratedQueryTypes {}
  interface CustomerMutations extends GeneratedMutationTypes {}
}
