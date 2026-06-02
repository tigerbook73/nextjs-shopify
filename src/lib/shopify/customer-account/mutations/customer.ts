import { parse } from "graphql";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type {
  CustomerUpdateMutation,
  CustomerUpdateMutationVariables,
} from "@/types/generated/customer-account/customer.generated";

export const UPDATE_CUSTOMER_MUTATION: TypedDocumentNode<CustomerUpdateMutation, CustomerUpdateMutationVariables> =
  parse(/* GraphQL */ `
    mutation CustomerUpdate($input: CustomerUpdateInput!) {
      customerUpdate(input: $input) {
        customer {
          firstName
          lastName
          emailAddress {
            emailAddress
          }
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `);
