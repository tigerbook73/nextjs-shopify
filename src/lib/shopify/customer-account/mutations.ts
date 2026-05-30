export const UPDATE_CUSTOMER_MUTATION = /* GraphQL */ `
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
`;

export const ADDRESS_CREATE_MUTATION = /* GraphQL */ `
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
`;

export const ADDRESS_UPDATE_MUTATION = /* GraphQL */ `
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
`;

export const ADDRESS_DELETE_MUTATION = /* GraphQL */ `
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
`;

export const ADDRESS_SET_DEFAULT_MUTATION = /* GraphQL */ `
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
`;
