import Link from "next/link";
import { redirect } from "next/navigation";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { GET_ADDRESSES_QUERY } from "@/lib/shopify/customer-account/queries";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import { deleteAddress, setDefaultAddress } from "@/lib/actions/address";
import type { CustomerAddress } from "@/types/customer-account";

export const dynamic = "force-dynamic";
export const metadata = { title: "Addresses" };

type FormAction = (formData: FormData) => void;

export default async function AddressesPage() {
  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/api/auth/login");

  let addresses: CustomerAddress[] = [];
  let defaultAddressId: string | null = null;
  try {
    const data = await customerAccountFetch<{
      customer: { defaultAddress: { id: string } | null; addresses: { nodes: CustomerAddress[] } };
    }>(accessToken, GET_ADDRESSES_QUERY, { first: 50 });
    addresses = data.customer?.addresses.nodes ?? [];
    defaultAddressId = data.customer?.defaultAddress?.id ?? null;
  } catch {
    redirect("/api/auth/login");
  }

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Addresses</h1>
        <Link
          href="/account/addresses/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Add address
        </Link>
      </div>

      {addresses.length === 0 ? (
        <p className="text-sm text-gray-500">No saved addresses.</p>
      ) : (
        <ul className="space-y-4">
          {addresses.map((address) => {
            const isDefault = address.id === defaultAddressId;
            const encodedId = Buffer.from(address.id).toString("base64url");
            const deleteWithId = deleteAddress.bind(null, address.id) as unknown as FormAction;
            const setDefaultWithId = setDefaultAddress.bind(null, address.id) as unknown as FormAction;

            return (
              <li key={address.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-sm">
                    {isDefault && (
                      <span className="mb-1 inline-block rounded bg-gray-900 px-2 py-0.5 text-xs text-white">
                        Default
                      </span>
                    )}
                    <p className="font-medium">
                      {address.firstName} {address.lastName}
                    </p>
                    <p className="text-gray-600">{address.address1}</p>
                    {address.address2 && <p className="text-gray-600">{address.address2}</p>}
                    <p className="text-gray-600">
                      {address.city}
                      {address.province ? `, ${address.province}` : ""} {address.zip}
                    </p>
                    <p className="text-gray-600">{address.country}</p>
                    {address.phone && <p className="text-gray-600">{address.phone}</p>}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 text-sm">
                    <Link href={`/account/addresses/${encodedId}/edit`} className="hover:underline">
                      Edit
                    </Link>
                    {!isDefault && (
                      <form action={setDefaultWithId}>
                        <button type="submit" className="hover:underline">
                          Set as default
                        </button>
                      </form>
                    )}
                    <form action={deleteWithId}>
                      <button type="submit" className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
