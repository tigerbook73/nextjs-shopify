import { parse } from "graphql";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type {
  GetAddressesQuery,
  GetAddressesQueryVariables,
} from "@/types/generated/customer-account/customer.generated";

export const GET_ADDRESSES_QUERY: TypedDocumentNode<GetAddressesQuery, GetAddressesQueryVariables> = parse(
  /* GraphQL */ `
    query GetAddresses($first: Int!) {
      customer {
        defaultAddress {
          id
        }
        addresses(first: $first) {
          nodes {
            id
            firstName
            lastName
            address1
            address2
            city
            province
            provinceCode: zoneCode
            zip
            country
            countryCode: territoryCode
            phone: phoneNumber
          }
        }
      }
    }
  `,
);
