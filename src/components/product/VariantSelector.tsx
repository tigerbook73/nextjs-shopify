"use client";

import { useState } from "react";
import type { ProductVariant } from "@/lib/shopify/storefront/types";
import { formatPrice } from "@/lib/utils/format-price";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Option {
  name: string;
  optionValues: { name: string }[];
}

interface VariantSelectorProps {
  options: Option[];
  variants: ProductVariant[];
}

export default function VariantSelector({ options, variants }: VariantSelectorProps) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((o) => [o.name, o.optionValues[0]?.name ?? ""])),
  );

  const matchedVariant = variants.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value));

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <div key={option.name}>
          <Label className="mb-1">{option.name}</Label>
          <Select
            value={selected[option.name]}
            // value is always string here; Base UI types it as string | null but SelectItem values are always non-null
            onValueChange={(value) => setSelected((prev) => ({ ...prev, [option.name]: value! }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {option.optionValues.map(({ name }) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {matchedVariant && !matchedVariant.availableForSale && <p className="text-sm text-red-500">Out of stock</p>}
    </div>
  );
}
