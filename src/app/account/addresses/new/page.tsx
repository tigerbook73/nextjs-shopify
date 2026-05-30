import { createAddress } from "@/lib/actions/address";

export const metadata = { title: "Add address" };

type FormAction = (formData: FormData) => void;

export default function NewAddressPage() {
  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Add address</h1>
      <AddressForm action={createAddress as unknown as FormAction} />
    </main>
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
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="defaultAddress" value="true" />
        Set as default address
      </label>
      <button
        type="submit"
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        Save address
      </button>
    </form>
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
