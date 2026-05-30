import { redirect } from "next/navigation";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { GET_CUSTOMER_QUERY } from "@/lib/shopify/customer-account/queries";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import { updateProfile } from "@/lib/actions/profile";
import type { CustomerProfile } from "@/types/customer-account";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/api/auth/login");

  let customer: CustomerProfile;
  try {
    const data = await customerAccountFetch<{ customer: CustomerProfile | null }>(accessToken, GET_CUSTOMER_QUERY);
    if (!data.customer) redirect("/api/auth/login");
    customer = data.customer;
  } catch {
    redirect("/api/auth/login");
  }

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>
      <form action={updateProfile as (formData: FormData) => void} className="max-w-md space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="firstName">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={customer.firstName ?? ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="lastName">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            defaultValue={customer.lastName ?? ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={customer.emailAddress?.emailAddress ?? ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Save changes
        </button>
      </form>
    </main>
  );
}
