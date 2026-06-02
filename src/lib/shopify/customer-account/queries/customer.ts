export const GET_CUSTOMER_QUERY = /* GraphQL */ `
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
    }
  }
`;
