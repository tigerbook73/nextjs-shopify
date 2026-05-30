"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import {
  ADDRESS_CREATE_MUTATION,
  ADDRESS_DELETE_MUTATION,
  ADDRESS_SET_DEFAULT_MUTATION,
  ADDRESS_UPDATE_MUTATION,
} from "@/lib/shopify/customer-account/mutations";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import type { AddressInput, CustomerActionResult } from "@/types/customer-account";

function extractAddressInput(formData: FormData): AddressInput {
  return {
    firstName: (formData.get("firstName") as string) || undefined,
    lastName: (formData.get("lastName") as string) || undefined,
    address1: (formData.get("address1") as string) || undefined,
    address2: (formData.get("address2") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    zoneCode: (formData.get("province") as string) || undefined,
    zip: (formData.get("zip") as string) || undefined,
    territoryCode: (formData.get("country") as string) || undefined,
    phoneNumber: (formData.get("phone") as string) || undefined,
  };
}

type MutationWithUserErrors = { userErrors: { message: string }[] };

function firstError(data: Record<string, MutationWithUserErrors>): string | null {
  const key = Object.keys(data)[0];
  const errors = data[key]?.userErrors;
  return errors?.length ? errors[0].message : null;
}

export async function createAddress(formData: FormData): Promise<CustomerActionResult> {
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Not logged in" };

  const address = extractAddressInput(formData);
  const defaultAddress = formData.get("defaultAddress") === "true";

  let data: { customerAddressCreate: MutationWithUserErrors };
  try {
    data = await customerAccountFetch(token, ADDRESS_CREATE_MUTATION, { address, defaultAddress });
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create address" };
  }

  const err = firstError(data as Record<string, MutationWithUserErrors>);
  if (err) return { success: false, error: err };

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function updateAddress(addressId: string, formData: FormData): Promise<CustomerActionResult> {
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Not logged in" };

  const address = extractAddressInput(formData);
  const defaultAddress = formData.get("defaultAddress") === "true";

  let data: { customerAddressUpdate: MutationWithUserErrors };
  try {
    data = await customerAccountFetch(token, ADDRESS_UPDATE_MUTATION, { addressId, address, defaultAddress });
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update address" };
  }

  const err = firstError(data as Record<string, MutationWithUserErrors>);
  if (err) return { success: false, error: err };

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function deleteAddress(addressId: string): Promise<CustomerActionResult> {
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Not logged in" };

  let data: { customerAddressDelete: MutationWithUserErrors };
  try {
    data = await customerAccountFetch(token, ADDRESS_DELETE_MUTATION, { addressId });
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete address" };
  }

  const err = firstError(data as Record<string, MutationWithUserErrors>);
  if (err) return { success: false, error: err };

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function setDefaultAddress(addressId: string): Promise<CustomerActionResult> {
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Not logged in" };

  let data: { customerAddressUpdate: MutationWithUserErrors };
  try {
    data = await customerAccountFetch(token, ADDRESS_SET_DEFAULT_MUTATION, { addressId });
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Operation failed" };
  }

  const err = firstError(data as Record<string, MutationWithUserErrors>);
  if (err) return { success: false, error: err };

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}
