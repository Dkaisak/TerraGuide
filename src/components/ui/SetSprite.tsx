"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export function SetSprite({
  setId,
  fallback,
  size = "md",
}: {
  setId: string;
  fallback: ReactNode;
  size?: "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const dims = size === "lg" ? "h-11 w-11" : "h-9 w-9";

  if (failed) return <>{fallback}</>;

  return (
    <span
      className={`flex items-center justify-center ${dims} text-center`}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/sets/${setId}.png`}
        alt=""
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
        className="h-full w-full object-contain [image-rendering:pixelated]"
      />
    </span>
  );
}
