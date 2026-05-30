/**
 * @test-file   Profile Server Action
 * @description updateProfile — mutation call, revalidation, and error handling
 * @ai-generated
 * @reviewed-by
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/shopify/customer-account/config", () => ({
  SHOP_ID: "test-shop-id",
  CLIENT_ID: "test-client-id",
  APP_URL: "http://localhost:3000",
  REDIRECT_URI: "http://localhost:3000/api/auth/callback",
  SHOPIFY_STORE_DOMAIN: "test.myshopify.com",
}));

vi.mock("@/lib/shopify/customer-account/tokens", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/shopify/customer-account/tokens")>();
  return { ...actual, getAccessToken: vi.fn() };
});

vi.mock("@/lib/shopify/customer-account/client", () => ({
  customerAccountFetch: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { getAccessToken } = await import("@/lib/shopify/customer-account/tokens");
const { customerAccountFetch } = await import("@/lib/shopify/customer-account/client");
const { redirect } = await import("next/navigation");
const { revalidatePath } = await import("next/cache");
const { updateProfile } = await import("@/lib/actions/profile");

const mockGetToken = vi.mocked(getAccessToken);
const mockFetch = vi.mocked(customerAccountFetch);
const mockRedirect = vi.mocked(redirect);
const mockRevalidate = vi.mocked(revalidatePath);

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

describe("updateProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * @test-suite  Unauthenticated
   * @target      early return when no token
   * @strategy    unit — getAccessToken mocked to return undefined
   * @cases
   *   - [FAIL] returns error when no access token
   */
  describe("Unauthenticated", () => {
    it("returns error when no access token", async () => {
      mockGetToken.mockResolvedValue(undefined);
      const result = await updateProfile(makeFormData({ firstName: "Ada" }));
      expect(result).toEqual({ success: false, error: "Not logged in" });
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  /**
   * @test-suite  Successful update
   * @target      mutation call, revalidation, and redirect on success
   * @strategy    unit — customerAccountFetch mocked to return no userErrors
   * @cases
   *   - [PASS] calls mutation with correct variables when form data is valid
   *   - [PASS] revalidates /account and /account/profile when update succeeds
   *   - [PASS] redirects to /account/profile when update succeeds
   */
  describe("Successful update", () => {
    beforeEach(() => {
      mockGetToken.mockResolvedValue("valid-token");
      mockFetch.mockResolvedValue({ customerUpdate: { userErrors: [] } });
    });

    it("calls mutation with correct variables when form data is valid", async () => {
      await updateProfile(makeFormData({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" }));
      expect(mockFetch).toHaveBeenCalledWith("valid-token", expect.stringContaining("CustomerUpdate"), {
        input: { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" },
      });
    });

    it("revalidates /account and /account/profile when update succeeds", async () => {
      await updateProfile(makeFormData({ firstName: "Ada" }));
      expect(mockRevalidate).toHaveBeenCalledWith("/account");
      expect(mockRevalidate).toHaveBeenCalledWith("/account/profile");
    });

    it("redirects to /account/profile when update succeeds", async () => {
      await updateProfile(makeFormData({ firstName: "Ada" }));
      expect(mockRedirect).toHaveBeenCalledWith("/account/profile");
    });
  });

  /**
   * @test-suite  API errors
   * @target      error propagation from userErrors and network failures
   * @strategy    unit — customerAccountFetch mocked to return errors or throw
   * @cases
   *   - [FAIL] returns userErrors message when mutation returns userErrors
   *   - [FAIL] returns error message when customerAccountFetch throws
   */
  describe("API errors", () => {
    beforeEach(() => mockGetToken.mockResolvedValue("valid-token"));

    it("returns userErrors message when mutation returns userErrors", async () => {
      mockFetch.mockResolvedValue({
        customerUpdate: { userErrors: [{ message: "Email is already taken" }] },
      });
      const result = await updateProfile(makeFormData({ email: "taken@example.com" }));
      expect(result).toEqual({ success: false, error: "Email is already taken" });
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("returns error message when customerAccountFetch throws", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));
      const result = await updateProfile(makeFormData({ firstName: "Ada" }));
      expect(result).toEqual({ success: false, error: "Network error" });
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
