/**
 * @test-file   SignInButton
 * @description Unit tests for SignInButton — verifies return_to href construction
 * @ai-generated
 * @reviewed-by (!HUMAN EDIT ONLY): Shengtian Liao @ [2]
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SignInButton from "./SignInButton";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from "next/navigation";

/**
 * @test-suite  SignInButton href construction
 * @target      href attribute includes correct return_to query param for the current pathname
 * @strategy    component — usePathname mocked to control current route
 * @cases
 *   - [PASS] builds href with return_to=/products when on /products
 *   - [PASS] builds href with return_to=/ when on /
 */
describe("SignInButton", () => {
  it("builds href with return_to=/products when on /products", () => {
    vi.mocked(usePathname).mockReturnValue("/products");
    render(<SignInButton />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/api/auth/login?return_to=/products");
  });

  it("builds href with return_to=/ when on /", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<SignInButton />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/api/auth/login?return_to=/");
  });
});
