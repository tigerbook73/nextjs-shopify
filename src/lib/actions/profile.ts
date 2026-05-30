"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { UPDATE_CUSTOMER_MUTATION } from "@/lib/shopify/customer-account/mutations";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import type { CustomerActionResult } from "@/types/customer-account";

export async function updateProfile(formData: FormData): Promise<CustomerActionResult> {
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Not logged in" };

  const input = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
  };

  let data: { customerUpdate: { userErrors: { message: string }[] } };
  try {
    data = await customerAccountFetch(token, UPDATE_CUSTOMER_MUTATION, { input });
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Update failed" };
  }

  if (data.customerUpdate.userErrors.length > 0) {
    return { success: false, error: data.customerUpdate.userErrors[0].message };
  }

  revalidatePath("/account");
  revalidatePath("/account/profile");
  redirect("/account/profile");
}
