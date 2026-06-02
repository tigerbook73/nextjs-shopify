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
