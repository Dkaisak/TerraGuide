import type { Subclass } from "@/types/data";

export const SUB_CLASS_TONE: Record<Subclass, string> = {
  SWORD: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  YOYO: "border-violet-400/40 bg-violet-400/10 text-violet-300",
  FLAIL: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  SPEAR: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  BOOMERANG: "border-teal-400/40 bg-teal-400/10 text-teal-300",
  BOW: "border-lime-400/40 bg-lime-400/10 text-lime-300",
  GUN: "border-orange-400/40 bg-orange-400/10 text-orange-300",
  LAUNCHER: "border-red-400/40 bg-red-400/10 text-red-300",
  THROWN: "border-zinc-400/40 bg-zinc-400/10 text-zinc-300",
  STAFF: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  TOME: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
  MAGIC_GUN: "border-rose-400/40 bg-rose-400/10 text-rose-300",
  MINION: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  WHIP: "border-red-400/40 bg-red-400/10 text-red-300",
  SENTRY: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
};

export function subclassTone(subclass?: Subclass): string | undefined {
  return subclass ? SUB_CLASS_TONE[subclass] : undefined;
}