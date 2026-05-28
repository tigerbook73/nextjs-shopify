"use client";

import { useState } from "react";

export default function AnnouncementBar({ dismissed }: { dismissed: boolean }) {
  const [closed, setClosed] = useState(false);

  if (dismissed || closed) return null;

  return (
    <div className="relative bg-gray-900 px-4 py-2 text-center text-sm text-white">
      Free shipping on all orders · Save $50 on orders over $299
      <button
        onClick={() => {
          document.cookie = "ann-dismissed=1; max-age=31536000; path=/";
          setClosed(true);
        }}
        aria-label="Close announcement"
        className="absolute top-1/2 right-4 -translate-y-1/2 text-white/70 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}
