import { parse } from "graphql";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type {
  CustomerAddressCreateMutation,
  CustomerAddressCreateMutationVariables,
  CustomerAddressUpdateMutation,
  CustomerAddressUpdateMutationVariables,
  CustomerAddressDeleteMutation,
  CustomerAddressDeleteMutationVariables,
  CustomerAddressSetDefaultMutation,
  CustomerAddressSetDefaultMutationVariables,
} from "@/types/generated/customer-account/customer.generated";

export const ADDRESS_CREATE_MUTATION: TypedDocumentNode<
  CustomerAddressCreateMutation,
  CustomerAddressCreateMutationVariables
> = parse(/* GraphQL */ `
  mutation CustomerAddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`);

export const ADDRESS_UPDATE_MUTATION: TypedDocumentNode<
  CustomerAddressUpdateMutation,
  CustomerAddressUpdateMutationVariables
> = parse(/* GraphQL */ `
  mutation CustomerAddressUpdate($addressId: ID!, $address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`);

export const ADDRESS_DELETE_MUTATION: TypedDocumentNode<
  CustomerAddressDeleteMutation,
  CustomerAddressDeleteMutationVariables
> = parse(/* GraphQL */ `
  mutation CustomerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        field
        message
        code
      }
    }
  }
`);

export const ADDRESS_SET_DEFAULT_MUTATION: TypedDocumentNode<
  CustomerAddressSetDefaultMutation,
  CustomerAddressSetDefaultMutationVariables
> = parse(/* GraphQL */ `
  mutation CustomerAddressSetDefault($addressId: ID!) {
    customerAddressUpdate(addressId: $addressId, address: {}, defaultAddress: true) {
      customerAddress {
        id
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`);
