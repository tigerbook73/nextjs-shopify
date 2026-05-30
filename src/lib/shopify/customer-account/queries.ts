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

export const GET_ORDERS_QUERY = /* GraphQL */ `
  query GetOrders($first: Int!, $after: String) {
    customer {
      orders(first: $first, after: $after) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 5) {
            nodes {
              title
              variantTitle
              quantity
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
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

export const GET_ORDER_DETAIL_QUERY = /* GraphQL */ `
  query GetOrderDetail($orderId: ID!) {
    order(id: $orderId) {
      id
      name
      processedAt
      financialStatus
      fulfillmentStatus
      totalPrice {
        amount
        currencyCode
      }
      subtotalPrice: subtotal {
        amount
        currencyCode
      }
      totalShippingPrice: totalShipping {
        amount
        currencyCode
      }
      totalTax {
        amount
        currencyCode
      }
      shippingAddress {
        firstName
        lastName
        address1
        address2
        city
        province
        zip
        country
        phone: phoneNumber
      }
      lineItems(first: 50) {
        nodes {
          title
          variantTitle
          quantity
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
      fulfillments(first: 5) {
        nodes {
          status
          updatedAt
          trackingInformation {
            url
            number
          }
        }
      }
    }
  }
`;

export const GET_ADDRESSES_QUERY = /* GraphQL */ `
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
`;
