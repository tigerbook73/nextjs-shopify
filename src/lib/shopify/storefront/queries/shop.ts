import { parse } from "graphql";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type { GetShopQuery, GetShopQueryVariables } from "@/types/generated/storefront/storefront.generated";

export const GET_SHOP_QUERY: TypedDocumentNode<GetShopQuery, GetShopQueryVariables> = parse(/* GraphQL */ `
  query GetShop {
    shop {
      name
      description
    }
  }
`);
