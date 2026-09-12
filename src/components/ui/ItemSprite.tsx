"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export function ItemSprite({
  itemId,
  fallback,
  size = "md",
}: {
  itemId: string;
  fallback: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const dims = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-5 w-5" : "h-9 w-9";

  if (failed) return <>{fallback}</>;

  return (
    <span
      className={`flex items-center justify-center ${dims} text-center`}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/items/${itemId}.png`}
        alt=""
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
        className="h-full w-full object-contain [image-rendering:pixelated]"
      />
    </span>
  );
}