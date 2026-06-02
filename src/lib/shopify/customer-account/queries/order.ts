import { parse } from "graphql";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type {
  GetOrdersQuery,
  GetOrdersQueryVariables,
  GetOrderDetailQuery,
  GetOrderDetailQueryVariables,
} from "@/types/generated/customer-account/customer.generated";

export const GET_ORDERS_QUERY: TypedDocumentNode<GetOrdersQuery, GetOrdersQueryVariables> = parse(/* GraphQL */ `
  query GetOrders($first: Int!, $after: String) {
    customer {
      orders(first: $first, after: $after) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 5) {
            nodes {
              title
              variantTitle
              quantity
              image {
                url
                altText
              }
              price {
                amount
                currencyCode
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`);

export const GET_ORDER_DETAIL_QUERY: TypedDocumentNode<GetOrderDetailQuery, GetOrderDetailQueryVariables> = parse(
  /* GraphQL */ `
    query GetOrderDetail($orderId: ID!) {
      order(id: $orderId) {
        id
        name
        processedAt
        financialStatus
        fulfillmentStatus
        totalPrice {
          amount
          currencyCode
        }
        subtotalPrice: subtotal {
          amount
          currencyCode
        }
        totalShippingPrice: totalShipping {
          amount
          currencyCode
        }
        totalTax {
          amount
          currencyCode
        }
        shippingAddress {
          firstName
          lastName
          address1
          address2
          city
          province
          zip
          country
          phone: phoneNumber
        }
        lineItems(first: 50) {
          nodes {
            title
            variantTitle
            quantity
            image {
              url
              altText
            }
            price {
              amount
              currencyCode
            }
          }
        }
        fulfillments(first: 5) {
          nodes {
            status
            updatedAt
            trackingInformation {
              url
              number
            }
          }
        }
      }
    }
  `,
);
