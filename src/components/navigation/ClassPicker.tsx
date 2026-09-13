"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { ClassType, GameStage } from "@/types/data";
import { CLASS_ORDER } from "@/types/data";
import { classSlug, stageSlug } from "@/lib/indexing";

// Sprite representativo de cada clase (icono de la tarjeta).
const CLASS_ICON: Record<ClassType, string> = {
  MELEE: "terra-blade",
  RANGED: "phantasm",
  MAGIC: "last-prism",
  SUMMONER: "stardust-dragon-staff",
  GENERAL: "ankh-shield",
};

export function ClassPicker({
  counts,
  targetStage,
  selected,
}: {
  counts: Partial<Record<ClassType, number>>;
  targetStage: GameStage;
  selected?: ClassType;
}) {
  const { classLabel, classTagline } = useLocale();
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {CLASS_ORDER.map((classType) => {
        const active = selected === classType;
        const href = `/${classSlug(classType)}/${stageSlug(targetStage)}`;
        const count = counts[classType] ?? 0;
        return (
          <Link
            key={classType}
            href={href}
            className={`tg-surface group flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors hover:border-accent ${
              active ? "border-accent ring-1 ring-accent/40" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/items/${CLASS_ICON[classType]}.png`}
              alt=""
              draggable={false}
              className="h-6 w-6 shrink-0 object-contain [image-rendering:pixelated]"
            />
            <span className="flex min-w-0 flex-col">
              <span
                className={`truncate text-sm font-bold leading-tight ${
                  active ? "text-accent" : "text-foreground"
                }`}
              >
                {classLabel(classType)}
              </span>
              <span className="truncate text-[11px] leading-tight text-zinc-500">
                {classTagline(classType)}
              </span>
            </span>
            <span className="ml-auto shrink-0 font-mono text-[10px] text-zinc-600">
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
