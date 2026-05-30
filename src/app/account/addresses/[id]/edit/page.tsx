import { notFound, redirect } from "next/navigation";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { GET_ADDRESSES_QUERY } from "@/lib/shopify/customer-account/queries";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import { updateAddress } from "@/lib/actions/address";
import type { CustomerAddress } from "@/types/customer-account";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit address" };

type FormAction = (formData: FormData) => void;

export default async function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const addressId = Buffer.from(id, "base64url").toString();

  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/api/auth/login");

  let address: CustomerAddress | undefined;
  try {
    const data = await customerAccountFetch<{
      customer: { addresses: { nodes: CustomerAddress[] } };
    }>(accessToken, GET_ADDRESSES_QUERY, { first: 50 });
    address = data.customer?.addresses.nodes.find((a) => a.id === addressId);
  } catch {
    redirect("/api/auth/login");
  }

  if (!address) notFound();

  const updateWithId = updateAddress.bind(null, addressId) as unknown as FormAction;

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Edit address</h1>
      <form action={updateWithId} className="max-w-md space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field id="firstName" name="firstName" label="First name" defaultValue={address.firstName ?? ""} />
          <Field id="lastName" name="lastName" label="Last name" defaultValue={address.lastName ?? ""} />
        </div>
        <Field id="address1" name="address1" label="Address line 1" defaultValue={address.address1 ?? ""} />
        <Field id="address2" name="address2" label="Address line 2 (optional)" defaultValue={address.address2 ?? ""} />
        <div className="grid grid-cols-2 gap-4">
          <Field id="city" name="city" label="City" defaultValue={address.city ?? ""} />
          <Field
            id="province"
            name="province"
            label="State / Province code"
            defaultValue={address.provinceCode ?? ""}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field id="zip" name="zip" label="ZIP / Postal code" defaultValue={address.zip ?? ""} />
          <Field id="country" name="country" label="Country code" defaultValue={address.countryCode ?? ""} />
        </div>
        <Field id="phone" name="phone" label="Phone (optional)" defaultValue={address.phone ?? ""} />
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

function Field({ id, name, label, defaultValue }: { id: string; name: string; label: string; defaultValue?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        defaultValue={defaultValue}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
      />
    </div>
  );
}
