/**
 * @test-file   VariantSelector
 * @description Variant selection state, matched-variant price display, Out of Stock, compareAtPrice
 * @ai-generated
 * @reviewed-by (!HUMAN EDIT ONLY): Shengtian Liao @ [1]
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VariantSelector from "./VariantSelector";
import type { ProductVariant } from "@/lib/shopify/storefront/types";

// Render Radix Select as a native <select> so jsdom can interact with it
vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (v: string) => void;
    children: React.ReactNode;
  }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

function makeVariant(
  id: string,
  title: string,
  optionValues: Record<string, string>,
  price: string,
  options?: { availableForSale?: boolean; compareAtPrice?: string },
): ProductVariant {
  return {
    id,
    title,
    availableForSale: options?.availableForSale ?? true,
    selectedOptions: Object.entries(optionValues).map(([name, value]) => ({ name, value })),
    price: { amount: price, currencyCode: "USD" },
    compareAtPrice: options?.compareAtPrice ? { amount: options.compareAtPrice, currencyCode: "USD" } : null,
  } as ProductVariant;
}

const singleOption = [{ name: "Size", optionValues: [{ name: "S" }, { name: "M" }, { name: "L" }] }];

const twoOptions = [
  { name: "Color", optionValues: [{ name: "Red" }, { name: "Blue" }] },
  { name: "Size", optionValues: [{ name: "S" }, { name: "M" }] },
];

describe("VariantSelector", () => {
  /**
   * @test-suite  Initial render
   * @target      first option value is selected by default; option labels are visible
   * @strategy    component — rendered with mocked Select
   * @cases
   *   - [PASS] renders the option name as a label
   *   - [PASS] displays the price of the initially matched variant
   */
  describe("Initial render", () => {
    it("renders the option name as a label", () => {
      const variants = [makeVariant("v1", "S", { Size: "S" }, "19.99")];
      render(<VariantSelector options={singleOption} variants={variants} />);
      expect(screen.getByText("Size")).toBeInTheDocument();
    });

    it("displays the price of the initially matched variant", () => {
      const variants = [makeVariant("v1", "S", { Size: "S" }, "19.99"), makeVariant("v2", "M", { Size: "M" }, "24.99")];
      render(<VariantSelector options={singleOption} variants={variants} />);
      expect(screen.getByText("$19.99")).toBeInTheDocument();
    });
  });

  /**
   * @test-suite  Variant selection
   * @target      matchedVariant updates when the select value changes
   * @strategy    component — fireEvent.change on native select mock
   * @cases
   *   - [PASS] updates displayed price when a different option is selected
   *   - [PASS] matches variant across multiple options
   */
  describe("Variant selection", () => {
    it("updates displayed price when a different option is selected", () => {
      const variants = [makeVariant("v1", "S", { Size: "S" }, "19.99"), makeVariant("v2", "M", { Size: "M" }, "29.99")];
      render(<VariantSelector options={singleOption} variants={variants} />);

      fireEvent.change(screen.getByRole("combobox"), { target: { value: "M" } });

      expect(screen.getByText("$29.99")).toBeInTheDocument();
      expect(screen.queryByText("$19.99")).not.toBeInTheDocument();
    });

    it("matches variant across multiple options", () => {
      const variants = [
        makeVariant("v1", "Red / S", { Color: "Red", Size: "S" }, "10.00"),
        makeVariant("v2", "Blue / M", { Color: "Blue", Size: "M" }, "20.00"),
      ];
      render(<VariantSelector options={twoOptions} variants={variants} />);

      // Change Color to Blue and Size to M
      const selects = screen.getAllByRole("combobox");
      fireEvent.change(selects[0], { target: { value: "Blue" } });
      fireEvent.change(selects[1], { target: { value: "M" } });

      expect(screen.getByText("$20.00")).toBeInTheDocument();
    });
  });

  /**
   * @test-suite  Out of Stock
   * @target      "Out of stock" message shows when matched variant is unavailable
   * @strategy    component — availableForSale=false on matched variant
   * @cases
   *   - [PASS] shows 'Out of stock' when the matched variant is unavailable
   *   - [PASS] does not show 'Out of stock' when the matched variant is available
   */
  describe("Out of Stock", () => {
    it("shows 'Out of stock' when the matched variant is unavailable", () => {
      const variants = [makeVariant("v1", "S", { Size: "S" }, "19.99", { availableForSale: false })];
      render(<VariantSelector options={singleOption} variants={variants} />);
      expect(screen.getByText("Out of stock")).toBeInTheDocument();
    });

    it("does not show 'Out of stock' when the matched variant is available", () => {
      const variants = [makeVariant("v1", "S", { Size: "S" }, "19.99", { availableForSale: true })];
      render(<VariantSelector options={singleOption} variants={variants} />);
      expect(screen.queryByText("Out of stock")).not.toBeInTheDocument();
    });
  });

  /**
   * @test-suite  compareAtPrice
   * @target      strikethrough price appears when compareAtPrice is present
   * @strategy    component — compareAtPrice set on matched variant
   * @cases
   *   - [PASS] renders strikethrough compare-at price when present
   *   - [PASS] does not render strikethrough when compareAtPrice is absent
   */
  describe("compareAtPrice", () => {
    it("renders strikethrough compare-at price when present", () => {
      const variants = [makeVariant("v1", "S", { Size: "S" }, "14.99", { compareAtPrice: "24.99" })];
      render(<VariantSelector options={singleOption} variants={variants} />);
      expect(screen.getByText("$14.99")).toBeInTheDocument();
      expect(screen.getByText("$24.99")).toBeInTheDocument();
    });

    it("does not render strikethrough when compareAtPrice is absent", () => {
      const variants = [makeVariant("v1", "S", { Size: "S" }, "19.99")];
      render(<VariantSelector options={singleOption} variants={variants} />);
      // Only one price element should be present
      expect(screen.getAllByText(/\$/).length).toBe(1);
    });
  });
});
