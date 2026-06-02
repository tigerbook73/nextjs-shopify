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
