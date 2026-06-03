/**
 * @test-file   SignInButton
 * @description Unit tests for SignInButton — verifies return_to href construction
 * @ai-generated
 * @reviewed-by Shengtian Liao @ [1]
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SignInButton from "./SignInButton";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from "next/navigation";

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
