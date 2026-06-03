import { parse } from "graphql";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type {
  GetCustomerQuery,
  GetCustomerQueryVariables,
} from "@/types/generated/customer-account/customer.generated";

export const GET_CUSTOMER_QUERY: TypedDocumentNode<GetCustomerQuery, GetCustomerQueryVariables> = parse(/* GraphQL */ `
  query GetCustomer {
    customer {
      id
      firstName
      lastName
      displayName
      emailAddress {
        emailAddress
      }
      orders(first: 100) {
        nodes {
          id
        }
        pageInfo {
          hasNextPage
        }
      }
      addresses(first: 100) {
        nodes {
          id
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`);
