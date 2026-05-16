'use client'

import { useState } from 'react'
import type { ProductVariant } from '@/lib/shopify/types'

interface Option {
  name: string
  values: string[]
}

interface VariantSelectorProps {
  options: Option[]
  variants: ProductVariant[]
}

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))
}

export default function VariantSelector({
  options,
  variants,
}: VariantSelectorProps) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((o) => [o.name, o.values[0]])),
  )

  const matchedVariant = variants.find((v) =>
    v.selectedOptions.every((o) => selected[o.name] === o.value),
  )

  const handleChange = (optionName: string, value: string) => {
    setSelected((prev) => ({ ...prev, [optionName]: value }))
  }

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <div key={option.name}>
          <label className="block text-sm font-medium text-gray-700">
            {option.name}
          </label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={selected[option.name]}
            onChange={(e) => handleChange(option.name, e.target.value)}
          >
            {option.values.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      ))}

      {matchedVariant && (
        <p className="text-lg font-semibold text-gray-900">
          {formatPrice(
            matchedVariant.price.amount,
            matchedVariant.price.currencyCode,
          )}
          {matchedVariant.compareAtPrice && (
            <span className="ml-2 text-sm font-normal text-gray-400 line-through">
              {formatPrice(
                matchedVariant.compareAtPrice.amount,
                matchedVariant.compareAtPrice.currencyCode,
              )}
            </span>
          )}
        </p>
      )}

      {matchedVariant && !matchedVariant.availableForSale && (
        <p className="text-sm text-red-500">Out of stock</p>
      )}
    </div>
  )
}
