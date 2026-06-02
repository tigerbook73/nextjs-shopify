import { parse } from "graphql";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type {
  CartCreateMutation,
  CartCreateMutationVariables,
  CartLinesAddMutation,
  CartLinesAddMutationVariables,
  CartLinesUpdateMutation,
  CartLinesUpdateMutationVariables,
  CartLinesRemoveMutation,
  CartLinesRemoveMutationVariables,
} from "@/types/generated/storefront/storefront.generated";
import { CART_DETAIL_FRAGMENT } from "../queries/cart";

export const CART_CREATE_MUTATION: TypedDocumentNode<CartCreateMutation, CartCreateMutationVariables> = parse(
  /* GraphQL */ `
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          ...CartDetail
        }
        userErrors {
          field
          message
        }
      }
    }
    ${CART_DETAIL_FRAGMENT}
  `,
);

export const CART_LINES_ADD_MUTATION: TypedDocumentNode<CartLinesAddMutation, CartLinesAddMutationVariables> = parse(
  /* GraphQL */ `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ...CartDetail
        }
        userErrors {
          field
          message
        }
      }
    }
    ${CART_DETAIL_FRAGMENT}
  `,
);

export const CART_LINES_UPDATE_MUTATION: TypedDocumentNode<CartLinesUpdateMutation, CartLinesUpdateMutationVariables> =
  parse(/* GraphQL */ `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ...CartDetail
        }
        userErrors {
          field
          message
        }
      }
    }
    ${CART_DETAIL_FRAGMENT}
  `);

export const CART_LINES_REMOVE_MUTATION: TypedDocumentNode<CartLinesRemoveMutation, CartLinesRemoveMutationVariables> =
  parse(/* GraphQL */ `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ...CartDetail
        }
        userErrors {
          field
          message
        }
      }
    }
    ${CART_DETAIL_FRAGMENT}
  `);
