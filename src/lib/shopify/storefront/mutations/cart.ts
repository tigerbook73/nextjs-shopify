import { CART_DETAIL_FRAGMENT } from "../queries/cart";

export const CART_CREATE_MUTATION = /* GraphQL */ `
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
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
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
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
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
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
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
`;
