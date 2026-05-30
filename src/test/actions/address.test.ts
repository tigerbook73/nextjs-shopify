/**
 * @test-file   Address Server Actions
 * @description createAddress, updateAddress, deleteAddress, setDefaultAddress — CRUD and error paths
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
const { createAddress, updateAddress, deleteAddress, setDefaultAddress } = await import("@/lib/actions/address");

const mockGetToken = vi.mocked(getAccessToken);
const mockFetch = vi.mocked(customerAccountFetch);
const mockRedirect = vi.mocked(redirect);
const mockRevalidate = vi.mocked(revalidatePath);

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

const sampleAddress = {
  firstName: "Ada",
  lastName: "Lovelace",
  address1: "123 Main St",
  city: "Shanghai",
  zip: "200000",
  country: "China",
};

describe("createAddress", () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * @test-suite  createAddress
   * @target      new address creation via mutation
   * @strategy    unit — customerAccountFetch mocked
   * @cases
   *   - [FAIL] returns error when no access token
   *   - [PASS] calls mutation and redirects when address created successfully
   *   - [FAIL] returns userErrors message when mutation returns errors
   *   - [FAIL] returns error message when customerAccountFetch throws
   */
  it("returns error when no access token", async () => {
    mockGetToken.mockResolvedValue(undefined);
    const result = await createAddress(makeFormData(sampleAddress));
    expect(result).toEqual({ success: false, error: "Not logged in" });
  });

  it("calls mutation and redirects when address created successfully", async () => {
    mockGetToken.mockResolvedValue("token");
    mockFetch.mockResolvedValue({ customerAddressCreate: { userErrors: [] } });
    await createAddress(makeFormData(sampleAddress));
    expect(mockFetch).toHaveBeenCalledWith(
      "token",
      expect.stringContaining("CustomerAddressCreate"),
      expect.any(Object),
    );
    expect(mockRevalidate).toHaveBeenCalledWith("/account/addresses");
    expect(mockRedirect).toHaveBeenCalledWith("/account/addresses");
  });

  it("returns userErrors message when mutation returns errors", async () => {
    mockGetToken.mockResolvedValue("token");
    mockFetch.mockResolvedValue({ customerAddressCreate: { userErrors: [{ message: "Address is invalid" }] } });
    const result = await createAddress(makeFormData(sampleAddress));
    expect(result).toEqual({ success: false, error: "Address is invalid" });
  });

  it("returns error message when customerAccountFetch throws", async () => {
    mockGetToken.mockResolvedValue("token");
    mockFetch.mockRejectedValue(new Error("Network error"));
    const result = await createAddress(makeFormData(sampleAddress));
    expect(result).toEqual({ success: false, error: "Network error" });
  });
});

describe("updateAddress", () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * @test-suite  updateAddress
   * @target      address update via mutation with addressId binding
   * @strategy    unit — customerAccountFetch mocked
   * @cases
   *   - [FAIL] returns error when no access token
   *   - [PASS] calls mutation with addressId and redirects when update succeeds
   *   - [FAIL] returns userErrors message when mutation returns errors
   */
  it("returns error when no access token", async () => {
    mockGetToken.mockResolvedValue(undefined);
    const result = await updateAddress("addr-1", makeFormData(sampleAddress));
    expect(result).toEqual({ success: false, error: "Not logged in" });
  });

  it("calls mutation with addressId and redirects when update succeeds", async () => {
    mockGetToken.mockResolvedValue("token");
    mockFetch.mockResolvedValue({ customerAddressUpdate: { userErrors: [] } });
    await updateAddress("addr-1", makeFormData(sampleAddress));
    expect(mockFetch).toHaveBeenCalledWith(
      "token",
      expect.stringContaining("CustomerAddressUpdate"),
      expect.objectContaining({ addressId: "addr-1" }),
    );
    expect(mockRedirect).toHaveBeenCalledWith("/account/addresses");
  });

  it("returns userErrors message when mutation returns errors", async () => {
    mockGetToken.mockResolvedValue("token");
    mockFetch.mockResolvedValue({ customerAddressUpdate: { userErrors: [{ message: "Invalid format" }] } });
    const result = await updateAddress("addr-1", makeFormData(sampleAddress));
    expect(result).toEqual({ success: false, error: "Invalid format" });
  });
});

describe("deleteAddress", () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * @test-suite  deleteAddress
   * @target      address deletion via mutation
   * @strategy    unit — customerAccountFetch mocked
   * @cases
   *   - [FAIL] returns error when no access token
   *   - [PASS] calls mutation with addressId and redirects when deletion succeeds
   *   - [FAIL] returns error message when customerAccountFetch throws
   */
  it("returns error when no access token", async () => {
    mockGetToken.mockResolvedValue(undefined);
    const result = await deleteAddress("addr-1");
    expect(result).toEqual({ success: false, error: "Not logged in" });
  });

  it("calls mutation with addressId and redirects when deletion succeeds", async () => {
    mockGetToken.mockResolvedValue("token");
    mockFetch.mockResolvedValue({ customerAddressDelete: { userErrors: [] } });
    await deleteAddress("addr-1");

    expect(mockFetch).toHaveBeenCalledWith("token", expect.stringContaining("CustomerAddressDelete"), {
      addressId: "addr-1",
    });
    expect(mockRedirect).toHaveBeenCalledWith("/account/addresses");
  });

  it("returns error message when customerAccountFetch throws", async () => {
    mockGetToken.mockResolvedValue("token");
    mockFetch.mockRejectedValue(new Error("Delete failed"));
    const result = await deleteAddress("addr-1");
    expect(result).toEqual({ success: false, error: "Delete failed" });
  });
});

describe("setDefaultAddress", () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * @test-suite  setDefaultAddress
   * @target      set default via ADDRESS_SET_DEFAULT_MUTATION
   * @strategy    unit — customerAccountFetch mocked
   * @cases
   *   - [FAIL] returns error when no access token
   *   - [PASS] calls set-default mutation and redirects when operation succeeds
   *   - [FAIL] returns userErrors message when mutation returns errors
   */
  it("returns error when no access token", async () => {
    mockGetToken.mockResolvedValue(undefined);
    const result = await setDefaultAddress("addr-1");
    expect(result).toEqual({ success: false, error: "Not logged in" });
  });

  it("calls set-default mutation and redirects when operation succeeds", async () => {
    mockGetToken.mockResolvedValue("token");
    mockFetch.mockResolvedValue({ customerAddressUpdate: { userErrors: [] } });
    await setDefaultAddress("addr-1");
    expect(mockFetch).toHaveBeenCalledWith("token", expect.stringContaining("CustomerAddressSetDefault"), {
      addressId: "addr-1",
    });
    expect(mockRedirect).toHaveBeenCalledWith("/account/addresses");
  });

  it("returns userErrors message when mutation returns errors", async () => {
    mockGetToken.mockResolvedValue("token");
    mockFetch.mockResolvedValue({ customerAddressUpdate: { userErrors: [{ message: "Operation failed" }] } });
    const result = await setDefaultAddress("addr-1");
    expect(result).toEqual({ success: false, error: "Operation failed" });
  });
});
