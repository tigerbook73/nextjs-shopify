"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form method="get" action="/search" className="flex w-full max-w-sm items-center gap-2">
      <Input type="search" name="q" defaultValue={defaultValue} placeholder="Search products..." />
      <Button type="submit">Search</Button>
    </form>
  );
}
