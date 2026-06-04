import { notFound, redirect } from "next/navigation";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { GET_ADDRESSES_QUERY } from "@/lib/shopify/customer-account/queries";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import { updateAddress } from "@/lib/actions/address";
import type { CustomerAddress } from "@/lib/shopify/customer-account/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DefaultAddressCheckbox from "@/components/account/DefaultAddressCheckbox";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit address" };

type FormAction = (formData: FormData) => void;

export default async function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const addressId = Buffer.from(id, "base64url").toString();

  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/api/auth/login");

  let address: CustomerAddress | undefined;
  let isDefaultAddress = false;
  try {
    const data = await customerAccountFetch(accessToken, GET_ADDRESSES_QUERY, { first: 50 });
    address = data.customer?.addresses.nodes.find((a) => a.id === addressId);
    isDefaultAddress = data.customer?.defaultAddress?.id === addressId;
  } catch {
    redirect("/api/auth/login");
  }

  if (!address) notFound();

  const updateWithId = updateAddress.bind(null, addressId) as unknown as FormAction;

  return (
    <div>
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
        <DefaultAddressCheckbox defaultChecked={isDefaultAddress} />
        <Button type="submit">Save changes</Button>
      </form>
    </div>
  );
}

function Field({ id, name, label, defaultValue }: { id: string; name: string; label: string; defaultValue?: string }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1">
        {label}
      </Label>
      <Input id={id} name={name} type="text" defaultValue={defaultValue} />
    </div>
  );
}
