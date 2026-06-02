"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DefaultAddressCheckboxProps {
  defaultChecked?: boolean;
}

export default function DefaultAddressCheckbox({ defaultChecked = false }: DefaultAddressCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="defaultAddress" name="defaultAddress" value="true" defaultChecked={defaultChecked} />
      <Label htmlFor="defaultAddress">Set as default address</Label>
    </div>
  );
}
