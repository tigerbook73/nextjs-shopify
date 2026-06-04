import { createAddress } from "@/lib/actions/address";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DefaultAddressCheckbox from "@/components/account/DefaultAddressCheckbox";

export const metadata = { title: "Add address" };

type FormAction = (formData: FormData) => void;

export default function NewAddressPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add address</h1>
      <AddressForm action={createAddress as unknown as FormAction} />
    </div>
  );
}

function AddressForm({ action }: { action: FormAction }) {
  return (
    <form action={action} className="max-w-md space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field id="firstName" name="firstName" label="First name" />
        <Field id="lastName" name="lastName" label="Last name" />
      </div>
      <Field id="address1" name="address1" label="Address line 1" />
      <Field id="address2" name="address2" label="Address line 2 (optional)" />
      <div className="grid grid-cols-2 gap-4">
        <Field id="city" name="city" label="City" />
        <Field id="province" name="province" label="State / Province code" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field id="zip" name="zip" label="ZIP / Postal code" />
        <Field id="country" name="country" label="Country code" />
      </div>
      <Field id="phone" name="phone" label="Phone (optional)" />
      <DefaultAddressCheckbox />
      <Button type="submit">Save address</Button>
    </form>
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
