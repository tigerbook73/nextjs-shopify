"use client";

import { useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "ann-dismissed";

function getSnapshot() {
  return !!localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return false;
}

export default function AnnouncementBar() {
  const [dismissedLocal, setDismissedLocal] = useState(false);
  const dismissedInStorage = useSyncExternalStore(() => () => {}, getSnapshot, getServerSnapshot);

  if (dismissedLocal || dismissedInStorage) return null;

  return (
    <div className="relative bg-gray-900 px-4 py-2 text-center text-sm text-white">
      全场包邮 · 满 299 立减 50
      <button
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, "1");
          setDismissedLocal(true);
        }}
        aria-label="关闭公告"
        className="absolute top-1/2 right-4 -translate-y-1/2 text-white/70 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}
