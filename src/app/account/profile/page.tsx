import { redirect } from "next/navigation";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { GET_CUSTOMER_QUERY } from "@/lib/shopify/customer-account/queries";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import { updateProfile } from "@/lib/actions/profile";
import type { CustomerProfile } from "@/lib/shopify/customer-account/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/api/auth/login");

  let customer: CustomerProfile;
  try {
    const data = await customerAccountFetch(accessToken, GET_CUSTOMER_QUERY);
    if (!data.customer) redirect("/api/auth/login");
    customer = data.customer;
  } catch {
    redirect("/api/auth/login");
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>
      <form action={updateProfile as (formData: FormData) => void} className="max-w-md space-y-4">
        <div>
          <Label htmlFor="firstName" className="mb-1">
            First name
          </Label>
          <Input id="firstName" name="firstName" type="text" defaultValue={customer.firstName ?? ""} />
        </div>
        <div>
          <Label htmlFor="lastName" className="mb-1">
            Last name
          </Label>
          <Input id="lastName" name="lastName" type="text" defaultValue={customer.lastName ?? ""} />
        </div>
        <div>
          <Label htmlFor="email" className="mb-1">
            Email
          </Label>
          <Input id="email" name="email" type="email" defaultValue={customer.emailAddress?.emailAddress ?? ""} />
        </div>
        <Button type="submit">Save changes</Button>
      </form>
    </div>
  );
}
