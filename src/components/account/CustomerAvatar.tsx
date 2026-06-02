"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CustomerAvatarProps {
  displayName: string;
}

export default function CustomerAvatar({ displayName }: CustomerAvatarProps) {
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Avatar className="size-16">
      <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
    </Avatar>
  );
}
