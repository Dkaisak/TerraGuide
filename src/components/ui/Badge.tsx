import type { ReactNode } from "react";

const TONES: Record<string, string> = {
  default: "border-edge-2 text-zinc-300",
  accent: "border-accent/40 bg-accent/10 text-accent",
  accent2: "border-accent-2/40 bg-accent-2/10 text-accent-2",
  neutral: "border-edge text-zinc-400",
};

export function Badge({
  children,
  tone = "default",
  className = "",
  title,
}: {
  children: ReactNode;
  tone?: keyof typeof TONES | string;
  className?: string;
  title?: string;
}) {
  const toneClass = TONES[tone] ?? TONES.default;
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}