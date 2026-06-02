"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { UPDATE_CUSTOMER_MUTATION } from "@/lib/shopify/customer-account/mutations";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import type { CustomerActionResult } from "@/lib/shopify/customer-account/types";
import type { CustomerUpdateMutation } from "@/types/generated/customer-account/customer.generated";

export async function updateProfile(formData: FormData): Promise<CustomerActionResult> {
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Not logged in" };

  const input = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
  };

  let data: CustomerUpdateMutation;
  try {
    data = await customerAccountFetch(token, UPDATE_CUSTOMER_MUTATION, { input });
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Update failed" };
  }

  const userErrors = data.customerUpdate?.userErrors ?? [];
  if (userErrors.length > 0) {
    return { success: false, error: userErrors[0].message };
  }

  revalidatePath("/account");
  revalidatePath("/account/profile");
  redirect("/account/profile");
}
