/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from "./storefront.types.js";

export type CartCreateMutationVariables = StorefrontTypes.Exact<{
  input: StorefrontTypes.CartInput;
}>;

export type CartCreateMutation = {
  cartCreate?: StorefrontTypes.Maybe<{
    cart?: StorefrontTypes.Maybe<
      Pick<StorefrontTypes.Cart, "id" | "checkoutUrl" | "totalQuantity"> & {
        lines: {
          nodes: Array<
            | (Pick<StorefrontTypes.CartLine, "id" | "quantity"> & {
                merchandise: Pick<StorefrontTypes.ProductVariant, "id" | "title"> & {
                  selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, "name" | "value">>;
                  price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
                  product: Pick<StorefrontTypes.Product, "title" | "handle"> & {
                    featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
                  };
                };
              })
            | (Pick<StorefrontTypes.ComponentizableCartLine, "id" | "quantity"> & {
                merchandise: Pick<StorefrontTypes.ProductVariant, "id" | "title"> & {
                  selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, "name" | "value">>;
                  price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
                  product: Pick<StorefrontTypes.Product, "title" | "handle"> & {
                    featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
                  };
                };
              })
          >;
        };
        cost: {
          subtotalAmount: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
          totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">>;
          totalAmount: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
        };
      }
    >;
    userErrors: Array<Pick<StorefrontTypes.CartUserError, "field" | "message">>;
  }>;
};

export type CartLinesAddMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars["ID"]["input"];
  lines: Array<StorefrontTypes.CartLineInput> | StorefrontTypes.CartLineInput;
}>;

export type CartLinesAddMutation = {
  cartLinesAdd?: StorefrontTypes.Maybe<{
    cart?: StorefrontTypes.Maybe<
      Pick<StorefrontTypes.Cart, "id" | "checkoutUrl" | "totalQuantity"> & {
        lines: {
          nodes: Array<
            | (Pick<StorefrontTypes.CartLine, "id" | "quantity"> & {
                merchandise: Pick<StorefrontTypes.ProductVariant, "id" | "title"> & {
                  selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, "name" | "value">>;
                  price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
                  product: Pick<StorefrontTypes.Product, "title" | "handle"> & {
                    featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
                  };
                };
              })
            | (Pick<StorefrontTypes.ComponentizableCartLine, "id" | "quantity"> & {
                merchandise: Pick<StorefrontTypes.ProductVariant, "id" | "title"> & {
                  selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, "name" | "value">>;
                  price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
                  product: Pick<StorefrontTypes.Product, "title" | "handle"> & {
                    featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
                  };
                };
              })
          >;
        };
        cost: {
          subtotalAmount: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
          totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">>;
          totalAmount: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
        };
      }
    >;
    userErrors: Array<Pick<StorefrontTypes.CartUserError, "field" | "message">>;
  }>;
};

export type CartLinesUpdateMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars["ID"]["input"];
  lines: Array<StorefrontTypes.CartLineUpdateInput> | StorefrontTypes.CartLineUpdateInput;
}>;

export type CartLinesUpdateMutation = {
  cartLinesUpdate?: StorefrontTypes.Maybe<{
    cart?: StorefrontTypes.Maybe<
      Pick<StorefrontTypes.Cart, "id" | "checkoutUrl" | "totalQuantity"> & {
        lines: {
          nodes: Array<
            | (Pick<StorefrontTypes.CartLine, "id" | "quantity"> & {
                merchandise: Pick<StorefrontTypes.ProductVariant, "id" | "title"> & {
                  selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, "name" | "value">>;
                  price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
                  product: Pick<StorefrontTypes.Product, "title" | "handle"> & {
                    featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
                  };
                };
              })
            | (Pick<StorefrontTypes.ComponentizableCartLine, "id" | "quantity"> & {
                merchandise: Pick<StorefrontTypes.ProductVariant, "id" | "title"> & {
                  selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, "name" | "value">>;
                  price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
                  product: Pick<StorefrontTypes.Product, "title" | "handle"> & {
                    featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
                  };
                };
              })
          >;
        };
        cost: {
          subtotalAmount: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
          totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">>;
          totalAmount: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
        };
      }
    >;
    userErrors: Array<Pick<StorefrontTypes.CartUserError, "field" | "message">>;
  }>;
};

export type CartLinesRemoveMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars["ID"]["input"];
  lineIds: Array<StorefrontTypes.Scalars["ID"]["input"]> | StorefrontTypes.Scalars["ID"]["input"];
}>;

export type CartLinesRemoveMutation = {
  cartLinesRemove?: StorefrontTypes.Maybe<{
    cart?: StorefrontTypes.Maybe<
      Pick<StorefrontTypes.Cart, "id" | "checkoutUrl" | "totalQuantity"> & {
        lines: {
          nodes: Array<
            | (Pick<StorefrontTypes.CartLine, "id" | "quantity"> & {
                merchandise: Pick<StorefrontTypes.ProductVariant, "id" | "title"> & {
                  selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, "name" | "value">>;
                  price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
                  product: Pick<StorefrontTypes.Product, "title" | "handle"> & {
                    featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
                  };
                };
              })
            | (Pick<StorefrontTypes.ComponentizableCartLine, "id" | "quantity"> & {
                merchandise: Pick<StorefrontTypes.ProductVariant, "id" | "title"> & {
                  selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, "name" | "value">>;
                  price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
                  product: Pick<StorefrontTypes.Product, "title" | "handle"> & {
                    featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
                  };
                };
              })
          >;
        };
        cost: {
          subtotalAmount: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
          totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">>;
          totalAmount: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
        };
      }
    >;
    userErrors: Array<Pick<StorefrontTypes.CartUserError, "field" | "message">>;
  }>;
};

export type CustomerCreateMutationVariables = StorefrontTypes.Exact<{
  input: StorefrontTypes.CustomerCreateInput;
}>;

export type CustomerCreateMutation = {
  customerCreate?: StorefrontTypes.Maybe<{
    customer?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Customer, "id" | "email" | "firstName" | "lastName">>;
    customerUserErrors: Array<Pick<StorefrontTypes.CustomerUserError, "field" | "message" | "code">>;
  }>;
};

export type CustomerAccessTokenCreateMutationVariables = StorefrontTypes.Exact<{
  input: StorefrontTypes.CustomerAccessTokenCreateInput;
}>;

export type CustomerAccessTokenCreateMutation = {
  customerAccessTokenCreate?: StorefrontTypes.Maybe<{
    customerAccessToken?: StorefrontTypes.Maybe<Pick<StorefrontTypes.CustomerAccessToken, "accessToken" | "expiresAt">>;
    customerUserErrors: Array<Pick<StorefrontTypes.CustomerUserError, "field" | "message" | "code">>;
  }>;
};

export type CustomerAccessTokenDeleteMutationVariables = StorefrontTypes.Exact<{
  customerAccessToken: StorefrontTypes.Scalars["String"]["input"];
}>;

export type CustomerAccessTokenDeleteMutation = {
  customerAccessTokenDelete?: StorefrontTypes.Maybe<
    Pick<StorefrontTypes.CustomerAccessTokenDeletePayload, "deletedAccessToken"> & {
      userErrors: Array<Pick<StorefrontTypes.UserError, "field" | "message">>;
    }
  >;
};

export type CartDetailFragment = Pick<StorefrontTypes.Cart, "id" | "checkoutUrl" | "totalQuantity"> & {
  lines: {
    nodes: Array<
      | (Pick<StorefrontTypes.CartLine, "id" | "quantity"> & {
          merchandise: Pick<StorefrontTypes.ProductVariant, "id" | "title"> & {
            selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, "name" | "value">>;
            price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
            product: Pick<StorefrontTypes.Product, "title" | "handle"> & {
              featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
            };
          };
        })
      | (Pick<StorefrontTypes.ComponentizableCartLine, "id" | "quantity"> & {
          merchandise: Pick<StorefrontTypes.ProductVariant, "id" | "title"> & {
            selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, "name" | "value">>;
            price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
            product: Pick<StorefrontTypes.Product, "title" | "handle"> & {
              featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
            };
          };
        })
    >;
  };
  cost: {
    subtotalAmount: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
    totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">>;
    totalAmount: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
  };
};

export type GetCartQueryVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars["ID"]["input"];
}>;

export type GetCartQuery = {
  cart?: StorefrontTypes.Maybe<
    Pick<StorefrontTypes.Cart, "id" | "checkoutUrl" | "totalQuantity"> & {
      lines: {
        nodes: Array<
          | (Pick<StorefrontTypes.CartLine, "id" | "quantity"> & {
              merchandise: Pick<StorefrontTypes.ProductVariant, "id" | "title"> & {
                selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, "name" | "value">>;
                price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
                product: Pick<StorefrontTypes.Product, "title" | "handle"> & {
                  featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
                };
              };
            })
          | (Pick<StorefrontTypes.ComponentizableCartLine, "id" | "quantity"> & {
              merchandise: Pick<StorefrontTypes.ProductVariant, "id" | "title"> & {
                selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, "name" | "value">>;
                price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
                product: Pick<StorefrontTypes.Product, "title" | "handle"> & {
                  featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
                };
              };
            })
        >;
      };
      cost: {
        subtotalAmount: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
        totalTaxAmount?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">>;
        totalAmount: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
      };
    }
  >;
};

export type GetCollectionsQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars["Int"]["input"];
}>;

export type GetCollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontTypes.Collection, "id" | "title" | "handle" | "description"> & {
        image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
        seo: Pick<StorefrontTypes.Seo, "title" | "description">;
      }
    >;
  };
};

export type GetCollectionByHandleQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars["String"]["input"];
  first?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars["Int"]["input"]>;
  last?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars["Int"]["input"]>;
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars["String"]["input"]>;
  before?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars["String"]["input"]>;
  sortKey?: StorefrontTypes.InputMaybe<StorefrontTypes.ProductCollectionSortKeys>;
  reverse?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars["Boolean"]["input"]>;
  filters?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.ProductFilter> | StorefrontTypes.ProductFilter>;
}>;

export type GetCollectionByHandleQuery = {
  collection?: StorefrontTypes.Maybe<
    Pick<StorefrontTypes.Collection, "id" | "title" | "handle" | "description"> & {
      image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
      seo: Pick<StorefrontTypes.Seo, "title" | "description">;
      products: {
        nodes: Array<
          Pick<StorefrontTypes.Product, "id" | "title" | "handle" | "availableForSale"> & {
            priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode"> };
            compareAtPriceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, "amount"> };
            featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
          }
        >;
        pageInfo: Pick<StorefrontTypes.PageInfo, "hasNextPage" | "hasPreviousPage" | "startCursor" | "endCursor">;
      };
    }
  >;
};

export type GetCollectionHandlesQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars["Int"]["input"];
}>;

export type GetCollectionHandlesQuery = { collections: { nodes: Array<Pick<StorefrontTypes.Collection, "handle">> } };

export type GetCustomerQueryVariables = StorefrontTypes.Exact<{
  token: StorefrontTypes.Scalars["String"]["input"];
}>;

export type GetCustomerQuery = {
  customer?: StorefrontTypes.Maybe<
    Pick<StorefrontTypes.Customer, "id" | "email" | "firstName" | "lastName" | "displayName">
  >;
};

export type GetCustomerOrdersQueryVariables = StorefrontTypes.Exact<{
  token: StorefrontTypes.Scalars["String"]["input"];
  first: StorefrontTypes.Scalars["Int"]["input"];
}>;

export type GetCustomerOrdersQuery = {
  customer?: StorefrontTypes.Maybe<{
    orders: {
      nodes: Array<
        Pick<StorefrontTypes.Order, "id" | "orderNumber" | "processedAt" | "financialStatus" | "fulfillmentStatus"> & {
          currentTotalPrice: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
          lineItems: {
            nodes: Array<
              Pick<StorefrontTypes.OrderLineItem, "title" | "quantity"> & {
                variant?: StorefrontTypes.Maybe<{
                  image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
                  price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
                }>;
              }
            >;
          };
        }
      >;
    };
  }>;
};

export type ProductCardFragment = Pick<StorefrontTypes.Product, "id" | "title" | "handle" | "availableForSale"> & {
  priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode"> };
  compareAtPriceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, "amount"> };
  featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
};

export type GetProductsQueryVariables = StorefrontTypes.Exact<{
  first?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars["Int"]["input"]>;
  last?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars["Int"]["input"]>;
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars["String"]["input"]>;
  before?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars["String"]["input"]>;
}>;

export type GetProductsQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontTypes.Product, "id" | "title" | "handle" | "availableForSale"> & {
        priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode"> };
        compareAtPriceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, "amount"> };
        featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
      }
    >;
    pageInfo: Pick<StorefrontTypes.PageInfo, "hasNextPage" | "hasPreviousPage" | "startCursor" | "endCursor">;
  };
};

export type GetProductByHandleQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars["String"]["input"];
}>;

export type GetProductByHandleQuery = {
  product?: StorefrontTypes.Maybe<
    Pick<StorefrontTypes.Product, "id" | "title" | "handle" | "description" | "descriptionHtml"> & {
      priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode"> };
      featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
      images: { nodes: Array<Pick<StorefrontTypes.Image, "url" | "altText">> };
      variants: {
        nodes: Array<
          Pick<StorefrontTypes.ProductVariant, "id" | "title" | "availableForSale"> & {
            selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, "name" | "value">>;
            price: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
            compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">>;
          }
        >;
      };
      seo: Pick<StorefrontTypes.Seo, "title" | "description">;
      options: Array<
        Pick<StorefrontTypes.ProductOption, "name"> & {
          optionValues: Array<Pick<StorefrontTypes.ProductOptionValue, "name">>;
        }
      >;
      collections: { nodes: Array<Pick<StorefrontTypes.Collection, "handle">> };
    }
  >;
};

export type SearchQueryVariables = StorefrontTypes.Exact<{
  query: StorefrontTypes.Scalars["String"]["input"];
  first?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars["Int"]["input"]>;
  last?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars["Int"]["input"]>;
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars["String"]["input"]>;
  before?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars["String"]["input"]>;
}>;

export type SearchQuery = {
  search: Pick<StorefrontTypes.SearchResultItemConnection, "totalCount"> & {
    nodes: Array<
      | { __typename: "Article" | "Page" }
      | ({ __typename: "Product" } & Pick<StorefrontTypes.Product, "id" | "title" | "handle" | "availableForSale"> & {
            priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode"> };
            compareAtPriceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, "amount"> };
            featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, "url" | "altText">>;
          })
    >;
    pageInfo: Pick<StorefrontTypes.PageInfo, "hasNextPage" | "hasPreviousPage" | "startCursor" | "endCursor">;
  };
};

export type GetShopQueryVariables = StorefrontTypes.Exact<{ [key: string]: never }>;

export type GetShopQuery = { shop: Pick<StorefrontTypes.Shop, "name" | "description"> };

interface GeneratedQueryTypes {
  "\n  query GetCart($cartId: ID!) {\n    cart(id: $cartId) {\n      ...CartDetail\n    }\n  }\n  \n": {
    return: GetCartQuery;
    variables: GetCartQueryVariables;
  };
  "\n  query GetCollections($first: Int!) {\n    collections(first: $first) {\n      nodes {\n        id\n        title\n        handle\n        description\n        image {\n          url\n          altText\n        }\n        seo {\n          title\n          description\n        }\n      }\n    }\n  }\n": {
    return: GetCollectionsQuery;
    variables: GetCollectionsQueryVariables;
  };
  "\n  query GetCollectionByHandle(\n    $handle: String!\n    $first: Int\n    $last: Int\n    $after: String\n    $before: String\n    $sortKey: ProductCollectionSortKeys\n    $reverse: Boolean\n    $filters: [ProductFilter!]\n  ) {\n    collection(handle: $handle) {\n      id\n      title\n      handle\n      description\n      image {\n        url\n        altText\n      }\n      seo {\n        title\n        description\n      }\n      products(\n        first: $first\n        last: $last\n        after: $after\n        before: $before\n        sortKey: $sortKey\n        reverse: $reverse\n        filters: $filters\n      ) {\n        nodes {\n          ...ProductCard\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n  \n": {
    return: GetCollectionByHandleQuery;
    variables: GetCollectionByHandleQueryVariables;
  };
  "\n  query GetCollectionHandles($first: Int!) {\n    collections(first: $first) {\n      nodes {\n        handle\n      }\n    }\n  }\n": {
    return: GetCollectionHandlesQuery;
    variables: GetCollectionHandlesQueryVariables;
  };
  "\n  query GetCustomer($token: String!) {\n    customer(customerAccessToken: $token) {\n      id\n      email\n      firstName\n      lastName\n      displayName\n    }\n  }\n": {
    return: GetCustomerQuery;
    variables: GetCustomerQueryVariables;
  };
  "\n  query GetCustomerOrders($token: String!, $first: Int!) {\n    customer(customerAccessToken: $token) {\n      orders(first: $first) {\n        nodes {\n          id\n          orderNumber\n          processedAt\n          financialStatus\n          fulfillmentStatus\n          currentTotalPrice {\n            amount\n            currencyCode\n          }\n          lineItems(first: 5) {\n            nodes {\n              title\n              quantity\n              variant {\n                image {\n                  url\n                  altText\n                }\n                price {\n                  amount\n                  currencyCode\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": {
    return: GetCustomerOrdersQuery;
    variables: GetCustomerOrdersQueryVariables;
  };
  "\n  query GetProducts($first: Int, $last: Int, $after: String, $before: String) {\n    products(first: $first, last: $last, after: $after, before: $before) {\n      nodes {\n        ...ProductCard\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n  \n": {
    return: GetProductsQuery;
    variables: GetProductsQueryVariables;
  };
  "\n  query GetProductByHandle($handle: String!) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n      description\n      descriptionHtml\n      priceRange {\n        minVariantPrice {\n          amount\n          currencyCode\n        }\n      }\n      featuredImage {\n        url\n        altText\n      }\n      images(first: 5) {\n        nodes {\n          url\n          altText\n        }\n      }\n      variants(first: 100) {\n        nodes {\n          id\n          title\n          availableForSale\n          selectedOptions {\n            name\n            value\n          }\n          price {\n            amount\n            currencyCode\n          }\n          compareAtPrice {\n            amount\n            currencyCode\n          }\n        }\n      }\n      seo {\n        title\n        description\n      }\n      options {\n        name\n        optionValues {\n          name\n        }\n      }\n      collections(first: 1) {\n        nodes {\n          handle\n        }\n      }\n    }\n  }\n": {
    return: GetProductByHandleQuery;
    variables: GetProductByHandleQueryVariables;
  };
  "\n  query Search($query: String!, $first: Int, $last: Int, $after: String, $before: String) {\n    search(query: $query, first: $first, last: $last, after: $after, before: $before, types: [PRODUCT]) {\n      totalCount\n      nodes {\n        __typename\n        ... on Product {\n          ...ProductCard\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n  \n": {
    return: SearchQuery;
    variables: SearchQueryVariables;
  };
  "\n  query GetShop {\n    shop {\n      name\n      description\n    }\n  }\n": {
    return: GetShopQuery;
    variables: GetShopQueryVariables;
  };
}

interface GeneratedMutationTypes {
  "\n  mutation CartCreate($input: CartInput!) {\n    cartCreate(input: $input) {\n      cart {\n        ...CartDetail\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n  \n": {
    return: CartCreateMutation;
    variables: CartCreateMutationVariables;
  };
  "\n  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {\n    cartLinesAdd(cartId: $cartId, lines: $lines) {\n      cart {\n        ...CartDetail\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n  \n": {
    return: CartLinesAddMutation;
    variables: CartLinesAddMutationVariables;
  };
  "\n  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {\n    cartLinesUpdate(cartId: $cartId, lines: $lines) {\n      cart {\n        ...CartDetail\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n  \n": {
    return: CartLinesUpdateMutation;
    variables: CartLinesUpdateMutationVariables;
  };
  "\n  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {\n    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {\n      cart {\n        ...CartDetail\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n  \n": {
    return: CartLinesRemoveMutation;
    variables: CartLinesRemoveMutationVariables;
  };
  "\n  mutation CustomerCreate($input: CustomerCreateInput!) {\n    customerCreate(input: $input) {\n      customer {\n        id\n        email\n        firstName\n        lastName\n      }\n      customerUserErrors {\n        field\n        message\n        code\n      }\n    }\n  }\n": {
    return: CustomerCreateMutation;
    variables: CustomerCreateMutationVariables;
  };
  "\n  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {\n    customerAccessTokenCreate(input: $input) {\n      customerAccessToken {\n        accessToken\n        expiresAt\n      }\n      customerUserErrors {\n        field\n        message\n        code\n      }\n    }\n  }\n": {
    return: CustomerAccessTokenCreateMutation;
    variables: CustomerAccessTokenCreateMutationVariables;
  };
  "\n  mutation CustomerAccessTokenDelete($customerAccessToken: String!) {\n    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {\n      deletedAccessToken\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {
    return: CustomerAccessTokenDeleteMutation;
    variables: CustomerAccessTokenDeleteMutationVariables;
  };
}
declare module "@shopify/storefront-api-client" {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
