"use client";

import { useState } from "react";
import type { ProductVariant } from "@/lib/shopify/types";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { formatPrice } from "@/lib/utils/format-price";

interface Option {
  name: string;
  optionValues: { name: string }[];
}

interface ProductFormProps {
  options: Option[];
  variants: ProductVariant[];
}

export default function ProductForm({ options, variants }: ProductFormProps) {
  const hasOptions = options.some((o) => o.optionValues.length > 1);

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((o) => [o.name, o.optionValues[0]?.name ?? ""])),
  );

  const matchedVariant = hasOptions
    ? variants.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value))
    : variants[0];

  return (
    <div className="space-y-4">
      {hasOptions &&
        options.map((option) => (
          <div key={option.name}>
            <label className="block text-sm font-medium text-gray-700">{option.name}</label>
            <select
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
              value={selected[option.name]}
              onChange={(e) => setSelected((prev) => ({ ...prev, [option.name]: e.target.value }))}
            >
              {option.optionValues.map(({ name }) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        ))}

      {matchedVariant && (
        <p className="text-lg font-semibold text-gray-900">
          {formatPrice(matchedVariant.price.amount, matchedVariant.price.currencyCode)}
          {matchedVariant.compareAtPrice && (
            <span className="ml-2 text-sm font-normal text-gray-400 line-through">
              {formatPrice(matchedVariant.compareAtPrice.amount, matchedVariant.compareAtPrice.currencyCode)}
            </span>
          )}
        </p>
      )}

      {matchedVariant && (
        <AddToCartButton variantId={matchedVariant.id} availableForSale={matchedVariant.availableForSale} />
      )}
    </div>
  );
}
