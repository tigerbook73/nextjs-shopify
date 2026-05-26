export const GET_CUSTOMER_QUERY = /* GraphQL */ `
  query GetCustomer($token: String!) {
    customer(customerAccessToken: $token) {
      id
      email
      firstName
      lastName
      displayName
    }
  }
`;

export const GET_CUSTOMER_ORDERS_QUERY = /* GraphQL */ `
  query GetCustomerOrders($token: String!, $first: Int!) {
    customer(customerAccessToken: $token) {
      orders(first: $first) {
        nodes {
          id
          orderNumber
          processedAt
          financialStatus
          fulfillmentStatus
          currentTotalPrice {
            amount
            currencyCode
          }
          lineItems(first: 5) {
            nodes {
              title
              quantity
              variant {
                image {
                  url
                  altText
                }
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;
