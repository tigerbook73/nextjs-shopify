import { parse } from "graphql";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type { GetCartQuery, GetCartQueryVariables } from "@/types/generated/storefront/storefront.generated";

export const CART_DETAIL_FRAGMENT = /* GraphQL */ `
  fragment CartDetail on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            product {
              title
              handle
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
  }
`;

export const GET_CART_QUERY: TypedDocumentNode<GetCartQuery, GetCartQueryVariables> = parse(/* GraphQL */ `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartDetail
    }
  }
  ${CART_DETAIL_FRAGMENT}
`);
